<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SystemNotification extends Model
{
    protected $fillable = ['organization_id','type','title','message','notifiable_type','notifiable_id','action_url','priority'];

    public function organization() { return $this->belongsTo(Organization::class); }
    public function recipients() { return $this->hasMany(NotificationRecipient::class); }

    public function notifiable() { return $this->morphTo(); }
}
