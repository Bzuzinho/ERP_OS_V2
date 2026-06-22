<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Organization extends Model
{
    use HasFactory;

    protected $fillable = [
        'name','slug','email','phone','address','city','postal_code',
        'district','county','nif','diggov_code','website',
        'logo','logo_secondary','description','is_active',
        'primary_color','accent_color',
        'sidebar_color','header_color','page_bg_color','card_bg_color',
        'heading_color','text_color','menu_text_color',
    ];

    protected $casts = ['is_active' => 'boolean'];

    public function users() { return $this->hasMany(User::class); }
    public function rolePermissions() { return $this->hasMany(RolePermission::class); }
    public function contacts() { return $this->hasMany(Contact::class); }
    public function tickets() { return $this->hasMany(Ticket::class); }
    public function serviceAreas() { return $this->hasMany(ServiceArea::class); }
    public function spaces() { return $this->hasMany(Space::class); }
    public function events() { return $this->hasMany(Event::class); }
    public function tasks() { return $this->hasMany(Task::class); }
    public function documents() { return $this->hasMany(Document::class); }
    public function employees() { return $this->hasMany(Employee::class); }
    public function departments() { return $this->hasMany(Department::class); }
    public function inventoryItems() { return $this->hasMany(InventoryItem::class); }
    public function reservations() { return $this->hasMany(SpaceReservation::class); }
    public function notifications() { return $this->hasMany(SystemNotification::class); }
}
