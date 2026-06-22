<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class MaterialLoan extends Model
{
    protected $fillable = [
        'organization_id','inventory_item_id','user_id','borrower_contact_id','team_id',
        'borrower_name','quantity','purpose','condition_out','condition_in',
        'loaned_at','expected_return_at','returned_at','status','notes',
    ];
    protected $casts = [
        'loaned_at'          => 'datetime',
        'expected_return_at' => 'datetime',
        'returned_at'        => 'datetime',
        'quantity'           => 'float',
    ];

    public function item()            { return $this->belongsTo(InventoryItem::class, 'inventory_item_id'); }
    public function registeredBy()    { return $this->belongsTo(User::class, 'user_id'); }
    public function borrowerContact() { return $this->belongsTo(Contact::class, 'borrower_contact_id'); }
    public function team()            { return $this->belongsTo(Team::class); }

    public function isOverdue(): bool
    {
        return $this->status === 'activo'
            && $this->expected_return_at
            && $this->expected_return_at->isPast();
    }
}
