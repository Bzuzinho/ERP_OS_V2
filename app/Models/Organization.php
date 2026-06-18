<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Organization extends Model
{
    use HasFactory;

    protected $fillable = ['name','slug','email','phone','address','city','postal_code','nif','logo','description','is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function users() { return $this->hasMany(User::class); }
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
