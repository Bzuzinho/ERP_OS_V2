<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use App\Models\MaterialLoan;
use App\Models\MaterialRequisition;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InventoryController extends Controller
{
    private int $orgId = 1;

    // ── Dados partilhados pelas 4 páginas ─────────────────────────────────────
    private function sharedLookups(): array
    {
        return [
            'categories' => InventoryCategory::where('organization_id', $this->orgId)->orderBy('name')->get(['id','name']),
            'teams'      => Team::where('organization_id', $this->orgId)->orderBy('name')->get(['id','name']),
            'suppliers'  => Contact::where('organization_id', $this->orgId)
                                   ->whereHas('personType', fn($q) => $q->where('category', 'entidade'))
                                   ->orderBy('name')
                                   ->get(['id','name','email','phone']),
        ];
    }

    // ── Catálogo ──────────────────────────────────────────────────────────────
    public function index(Request $request)
    {
        $q = InventoryItem::with(['category','supplier'])
            ->where('organization_id', $this->orgId);

        if ($request->filled('search'))
            $q->where(fn($q) => $q->where('name','like','%'.$request->search.'%')
                                   ->orWhere('reference','like','%'.$request->search.'%')
                                   ->orWhere('barcode','like','%'.$request->search.'%'));

        if ($request->filled('category'))  $q->where('inventory_category_id', $request->category);
        if ($request->filled('type'))      $q->where('item_type', $request->type);
        if ($request->filled('subcategory')) $q->where('subcategory', $request->subcategory);
        if ($request->filled('active'))    $q->where('is_active', $request->active === 'true');

        $items = $q->orderBy('name')->paginate(50)->withQueryString();

        return Inertia::render('Inventory/Index', array_merge($this->sharedLookups(), [
            'items'         => $items,
            'subcategories' => InventoryItem::where('organization_id', $this->orgId)
                                             ->whereNotNull('subcategory')
                                             ->distinct()->pluck('subcategory')->sort()->values(),
            'filters'       => $request->only(['search','category','type','subcategory','active']),
        ]));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'                  => 'required|string|max:255',
            'reference'             => 'nullable|string|max:100',
            'barcode'               => 'nullable|string|max:100',
            'inventory_category_id' => 'nullable|exists:inventory_categories,id',
            'supplier_id'           => 'nullable|exists:contacts,id',
            'subcategory'           => 'nullable|string|max:100',
            'item_type'             => 'required|in:consumivel,reutilizavel,equipamento,epi',
            'description'           => 'nullable|string|max:1000',
            'unit'                  => 'required|string|max:20',
            'current_stock'         => 'required|numeric|min:0',
            'min_stock'             => 'required|numeric|min:0',
            'max_stock'             => 'nullable|numeric|min:0',
            'location'              => 'nullable|string|max:255',
            'serial_number'         => 'nullable|string|max:100',
            'purchase_date'         => 'nullable|date',
            'purchase_price'        => 'nullable|numeric|min:0',
            'condition'             => 'nullable|string|max:50',
            'quality_grade'         => 'nullable|string|max:20',
            'quality_notes'         => 'nullable|string|max:500',
        ]);

        $item = InventoryItem::create(array_merge($data, ['organization_id' => $this->orgId]));

        // Registar movimento de abertura se stock > 0
        if ($item->current_stock > 0) {
            InventoryMovement::create([
                'organization_id'   => $this->orgId,
                'inventory_item_id' => $item->id,
                'user_id'           => Auth::id(),
                'type'              => 'entrada',
                'quantity'          => $item->current_stock,
                'notes'             => 'Stock inicial',
                'occurred_at'       => now(),
            ]);
        }

        return back()->with('message', 'Material criado com sucesso.');
    }

    public function update(Request $request, InventoryItem $item)
    {
        $data = $request->validate([
            'name'                  => 'required|string|max:255',
            'reference'             => 'nullable|string|max:100',
            'barcode'               => 'nullable|string|max:100',
            'inventory_category_id' => 'nullable|exists:inventory_categories,id',
            'supplier_id'           => 'nullable|exists:contacts,id',
            'subcategory'           => 'nullable|string|max:100',
            'item_type'             => 'required|in:consumivel,reutilizavel,equipamento,epi',
            'description'           => 'nullable|string|max:1000',
            'unit'                  => 'required|string|max:20',
            'min_stock'             => 'required|numeric|min:0',
            'max_stock'             => 'nullable|numeric|min:0',
            'location'              => 'nullable|string|max:255',
            'serial_number'         => 'nullable|string|max:100',
            'purchase_date'         => 'nullable|date',
            'purchase_price'        => 'nullable|numeric|min:0',
            'condition'             => 'nullable|string|max:50',
            'quality_grade'         => 'nullable|string|max:20',
            'quality_notes'         => 'nullable|string|max:500',
        ]);
        $item->update($data);
        return back()->with('message', 'Material atualizado.');
    }

    public function destroy(InventoryItem $item)
    {
        $item->update(['is_active' => false]);
        return back()->with('message', 'Material desativado.');
    }

    // ── Categorias ────────────────────────────────────────────────────────────
    public function storeCategory(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:100', 'description' => 'nullable|string|max:255']);
        InventoryCategory::create(array_merge($data, ['organization_id' => $this->orgId]));
        return back()->with('message', 'Categoria criada.');
    }

    // ── Stock ─────────────────────────────────────────────────────────────────
    public function stock()
    {
        $items = InventoryItem::with('category')
            ->where('organization_id', $this->orgId)
            ->where('is_active', true)
            ->orderByRaw('current_stock <= min_stock DESC') // alertas primeiro
            ->orderBy('name')
            ->get();

        $recentMovements = InventoryMovement::with(['item','registeredBy'])
            ->where('organization_id', $this->orgId)
            ->orderByDesc('occurred_at')
            ->limit(50)
            ->get();

        return Inertia::render('Inventory/Stock', [
            'items'           => $items,
            'recentMovements' => $recentMovements,
            'summary'         => [
                'total'    => $items->count(),
                'low'      => $items->filter(fn($i) => $i->isLowStock() && $i->current_stock > 0)->count(),
                'out'      => $items->filter(fn($i) => $i->isOutOfStock())->count(),
                'ok'       => $items->filter(fn($i) => !$i->isLowStock())->count(),
            ],
        ]);
    }

    public function addMovement(Request $request, InventoryItem $item)
    {
        $data = $request->validate([
            'type'     => 'required|in:entrada,saída,quebra,reposição',
            'quantity' => 'required|numeric|min:0.01',
            'notes'    => 'nullable|string|max:500',
        ]);

        $delta = in_array($data['type'], ['entrada','reposição']) ? $data['quantity'] : -$data['quantity'];
        $newStock = max(0, $item->current_stock + $delta);

        $item->update(['current_stock' => $newStock]);

        InventoryMovement::create([
            'organization_id'   => $this->orgId,
            'inventory_item_id' => $item->id,
            'user_id'           => Auth::id(),
            'type'              => $data['type'],
            'quantity'          => $data['quantity'],
            'notes'             => $data['notes'] ?? null,
            'occurred_at'       => now(),
        ]);

        return back()->with('message', 'Movimento registado.');
    }

    // ── Empréstimos ───────────────────────────────────────────────────────────
    public function loans()
    {
        $active = MaterialLoan::with(['item','borrowerContact','team','registeredBy'])
            ->where('organization_id', $this->orgId)
            ->where('status', 'activo')
            ->orderBy('expected_return_at')
            ->get()
            ->map(fn($l) => array_merge($l->toArray(), ['is_overdue' => $l->isOverdue()]));

        $history = MaterialLoan::with(['item','borrowerContact','team'])
            ->where('organization_id', $this->orgId)
            ->whereIn('status', ['devolvido','atrasado','perdido'])
            ->orderByDesc('returned_at')
            ->limit(100)
            ->get();

        return Inertia::render('Inventory/Loans', array_merge($this->sharedLookups(), [
            'activeLoans'  => $active,
            'historyLoans' => $history,
            'items'        => InventoryItem::where('organization_id', $this->orgId)
                                            ->where('is_active', true)
                                            ->where('item_type', 'reutilizavel')
                                            ->orWhere(fn($q) => $q->where('organization_id', $this->orgId)
                                                                   ->where('is_active', true)
                                                                   ->where('item_type', 'equipamento'))
                                            ->orderBy('name')
                                            ->get(['id','name','unit','current_stock']),
        ]));
    }

    public function storeLoan(Request $request)
    {
        $data = $request->validate([
            'inventory_item_id'   => 'required|exists:inventory_items,id',
            'borrower_contact_id' => 'nullable|exists:contacts,id',
            'team_id'             => 'nullable|exists:teams,id',
            'borrower_name'       => 'nullable|string|max:255',
            'quantity'            => 'required|numeric|min:0.01',
            'purpose'             => 'nullable|string|max:500',
            'condition_out'       => 'nullable|string|max:50',
            'loaned_at'           => 'required|date',
            'expected_return_at'  => 'nullable|date|after:loaned_at',
            'notes'               => 'nullable|string|max:500',
        ]);

        $item = InventoryItem::findOrFail($data['inventory_item_id']);
        if ($item->current_stock < $data['quantity'])
            return back()->withErrors(['quantity' => 'Stock insuficiente ('.$item->current_stock.' '.$item->unit.' disponíveis).']);

        MaterialLoan::create(array_merge($data, [
            'organization_id' => $this->orgId,
            'user_id'         => Auth::id(),
            'status'          => 'activo',
        ]));

        // Deduzir stock (movimento de saída por empréstimo)
        $item->decrement('current_stock', $data['quantity']);
        InventoryMovement::create([
            'organization_id'   => $this->orgId,
            'inventory_item_id' => $item->id,
            'user_id'           => Auth::id(),
            'type'              => 'empréstimo',
            'quantity'          => $data['quantity'],
            'notes'             => 'Empréstimo: '.($data['purpose'] ?? ''),
            'occurred_at'       => $data['loaned_at'],
        ]);

        return back()->with('message', 'Empréstimo registado.');
    }

    public function returnLoan(Request $request, MaterialLoan $loan)
    {
        $data = $request->validate([
            'condition_in' => 'nullable|string|max:50',
            'notes'        => 'nullable|string|max:500',
            'status'       => 'required|in:devolvido,perdido',
        ]);

        $loan->update(array_merge($data, ['returned_at' => now()]));

        // Repor stock se devolvido (não se perdido)
        if ($data['status'] === 'devolvido') {
            $loan->item->increment('current_stock', $loan->quantity);
            InventoryMovement::create([
                'organization_id'   => $this->orgId,
                'inventory_item_id' => $loan->inventory_item_id,
                'user_id'           => Auth::id(),
                'type'              => 'devolução',
                'quantity'          => $loan->quantity,
                'notes'             => 'Devolução de empréstimo',
                'occurred_at'       => now(),
            ]);
        }

        return back()->with('message', $data['status'] === 'devolvido' ? 'Devolução registada.' : 'Material marcado como perdido.');
    }

    // ── Requisições ───────────────────────────────────────────────────────────
    public function requisitions()
    {
        $pending = MaterialRequisition::with(['item','requester','team'])
            ->where('organization_id', $this->orgId)
            ->where('status', 'pendente')
            ->orderBy('created_at')
            ->get();

        $others = MaterialRequisition::with(['item','requester','approver','team'])
            ->where('organization_id', $this->orgId)
            ->whereIn('status', ['aprovada','rejeitada','entregue','cancelada'])
            ->orderByDesc('updated_at')
            ->limit(100)
            ->get();

        return Inertia::render('Inventory/Requisitions', array_merge($this->sharedLookups(), [
            'pendingRequisitions' => $pending,
            'otherRequisitions'   => $others,
            'items'               => InventoryItem::where('organization_id', $this->orgId)
                                                   ->where('is_active', true)
                                                   ->orderBy('name')
                                                   ->get(['id','name','unit','current_stock','item_type']),
        ]));
    }

    public function storeRequisition(Request $request)
    {
        $data = $request->validate([
            'inventory_item_id'  => 'required|exists:inventory_items,id',
            'team_id'            => 'nullable|exists:teams,id',
            'referenceable_type' => 'nullable|string',
            'referenceable_id'   => 'nullable|integer',
            'quantity_requested' => 'required|numeric|min:0.01',
            'purpose'            => 'nullable|string|max:500',
        ]);

        MaterialRequisition::create(array_merge($data, [
            'organization_id' => $this->orgId,
            'requester_id'    => Auth::id(),
            'status'          => 'pendente',
        ]));

        return back()->with('message', 'Requisição submetida.');
    }

    public function approveRequisition(Request $request, MaterialRequisition $req)
    {
        abort_if($req->status !== 'pendente', 422, 'Apenas requisições pendentes podem ser aprovadas.');
        $req->update([
            'status'      => 'aprovada',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);
        return back()->with('message', 'Requisição aprovada.');
    }

    public function rejectRequisition(Request $request, MaterialRequisition $req)
    {
        $data = $request->validate(['rejection_reason' => 'nullable|string|max:500']);
        abort_if($req->status !== 'pendente', 422, 'Apenas requisições pendentes podem ser rejeitadas.');
        $req->update(array_merge($data, ['status' => 'rejeitada']));
        return back()->with('message', 'Requisição rejeitada.');
    }

    public function deliverRequisition(Request $request, MaterialRequisition $req)
    {
        $data = $request->validate(['quantity_delivered' => 'required|numeric|min:0.01']);
        abort_if($req->status !== 'aprovada', 422, 'Apenas requisições aprovadas podem ser entregues.');

        $item = $req->item;
        if ($item->current_stock < $data['quantity_delivered'])
            return back()->withErrors(['quantity_delivered' => 'Stock insuficiente.']);

        $req->update(array_merge($data, ['status' => 'entregue', 'delivered_at' => now()]));

        $item->decrement('current_stock', $data['quantity_delivered']);
        InventoryMovement::create([
            'organization_id'   => $this->orgId,
            'inventory_item_id' => $item->id,
            'user_id'           => Auth::id(),
            'type'              => 'saída',
            'quantity'          => $data['quantity_delivered'],
            'notes'             => 'Requisição #'.$req->id.' entregue',
            'occurred_at'       => now(),
        ]);

        return back()->with('message', 'Material entregue e stock atualizado.');
    }

    // Compat: alocação para tarefas (mantido)
    public function allocate(Request $request, InventoryItem $item)
    {
        return back()->with('message', 'Use requisições para alocar materiais a tarefas.');
    }
    public function allocations()
    {
        return redirect()->route('inventory.requisitions');
    }
}
