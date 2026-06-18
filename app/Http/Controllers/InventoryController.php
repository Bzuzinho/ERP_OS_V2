<?php

namespace App\Http\Controllers;

use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use App\Models\MaterialAllocation;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = InventoryItem::with(['category','activeAllocations'])->orderBy('name');
        if ($request->filled('category'))  $query->where('inventory_category_id', $request->category);
        if ($request->filled('item_type')) $query->where('item_type', $request->item_type);
        if ($request->filled('low_stock')) $query->whereRaw('current_stock <= min_stock');

        return Inertia::render('Inventory/Index', [
            'items'           => $query->paginate(20)->withQueryString(),
            'categories'      => InventoryCategory::orderBy('name')->get(['id','name']),
            'filters'         => $request->only(['category','item_type','low_stock']),
            'low_stock_count' => InventoryItem::whereRaw('current_stock <= min_stock')->count(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'                  => 'required|string|max:255',
            'reference'             => 'nullable|string',
            'description'           => 'nullable|string',
            'item_type'             => 'required|in:consumivel,reutilizavel,equipamento',
            'inventory_category_id' => 'nullable|exists:inventory_categories,id',
            'unit'                  => 'required|string|max:20',
            'current_stock'         => 'nullable|numeric|min:0',
            'min_stock'             => 'required|numeric|min:0',
            'location'              => 'nullable|string',
            'serial_number'         => 'nullable|string',
            'purchase_date'         => 'nullable|date',
            'purchase_price'        => 'nullable|numeric|min:0',
            'condition'             => 'nullable|in:bom,regular,mau,inutilizado',
        ]);
        $data['organization_id'] = 1;
        InventoryItem::create($data);
        return back()->with('flash', ['success' => 'Item criado.']);
    }

    public function update(Request $request, InventoryItem $item)
    {
        $data = $request->validate([
            'name'                  => 'required|string|max:255',
            'reference'             => 'nullable|string',
            'description'           => 'nullable|string',
            'item_type'             => 'required|in:consumivel,reutilizavel,equipamento',
            'inventory_category_id' => 'nullable|exists:inventory_categories,id',
            'unit'                  => 'required|string|max:20',
            'min_stock'             => 'required|numeric|min:0',
            'location'              => 'nullable|string',
            'serial_number'         => 'nullable|string',
            'purchase_date'         => 'nullable|date',
            'purchase_price'        => 'nullable|numeric|min:0',
            'condition'             => 'nullable|in:bom,regular,mau,inutilizado',
            'is_active'             => 'boolean',
        ]);
        $item->update($data);
        return back()->with('flash', ['success' => 'Item atualizado.']);
    }

    public function addMovement(Request $request, InventoryItem $item)
    {
        $data = $request->validate([
            'type'     => 'required|in:entrada,saida,emprestimo,devolucao,quebra,reposicao',
            'quantity' => 'required|numeric|min:0.01',
            'reason'   => 'nullable|string',
        ]);

        InventoryMovement::create([
            'inventory_item_id' => $item->id,
            'organization_id'   => 1,
            'user_id'           => Auth::id(),
            'type'              => $data['type'],
            'quantity'          => $data['quantity'],
            'notes'             => $data['reason'] ?? null,
            'occurred_at'       => now(),
        ]);

        // Actualiza stock
        $delta = in_array($data['type'], ['entrada','devolucao','reposicao'])
            ? $data['quantity']
            : -$data['quantity'];

        $item->increment('current_stock', $delta);

        return back()->with('flash', ['success' => 'Movimento registado.']);
    }

    /** Alocar material reutilizável / equipamento a funcionário ou equipa */
    public function allocate(Request $request, InventoryItem $item)
    {
        $data = $request->validate([
            'allocated_to_type' => 'required|in:user,team,department',
            'allocated_to_id'   => 'nullable|integer',
            'allocated_to_name' => 'nullable|string|max:255',
            'quantity'          => 'required|numeric|min:0.001',
            'notes'             => 'nullable|string',
        ]);

        MaterialAllocation::create(array_merge($data, [
            'inventory_item_id' => $item->id,
            'status'            => 'em_uso',
            'allocated_at'      => now(),
            'created_by'        => Auth::id(),
        ]));

        return back()->with('flash', ['success' => 'Material alocado.']);
    }

    /** Registar devolução de uma alocação */
    public function returnAllocation(MaterialAllocation $allocation)
    {
        $allocation->update(['status' => 'devolvido', 'returned_at' => now()]);
        return back()->with('flash', ['success' => 'Devolução registada.']);
    }

    /** Listar alocações activas */
    public function allocations(Request $request)
    {
        $allocs = MaterialAllocation::with(['item','creator'])
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->item_id, fn($q) => $q->where('inventory_item_id', $request->item_id))
            ->orderByDesc('allocated_at')
            ->paginate(20)->withQueryString();

        $items = InventoryItem::where('item_type', '!=', 'consumivel')
            ->orderBy('name')->get(['id','name']);

        $users = User::where('is_active', true)->orderBy('name')->get(['id','name']);
        $teams = Team::where('is_active', true)->orderBy('name')->get(['id','name']);

        return Inertia::render('Inventory/Allocations', compact('allocs','items','users','teams'));
    }
}
