<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class MaterialRequisition extends Model
{
    protected $fillable = [
        'organization_id','inventory_item_id','requester_id','approved_by','team_id',
        'referenceable_type','referenceable_id',
        'quantity_requested','quantity_delivered','purpose',
        'status','rejection_reason','approved_at','delivered_at',
    ];
    protected $casts = [
        'approved_at'        => 'datetime',
        'delivered_at'       => 'datetime',
        'quantity_requested' => 'float',
        'quantity_delivered' => 'float',
    ];

    public function item()       { return $this->belongsTo(InventoryItem::class, 'inventory_item_id'); }
    public function requester()  { return $this->belongsTo(User::class, 'requester_id'); }
    public function approver()   { return $this->belongsTo(User::class, 'approved_by'); }
    public function team()       { return $this->belongsTo(Team::class); }
    public function referenceable() { return $this->morphTo(); }

    public function isPending():  bool { return $this->status === 'pendente'; }
    public function isApproved(): bool { return $this->status === 'aprovada'; }
    public function isDelivered(): bool { return $this->status === 'entregue'; }
}
