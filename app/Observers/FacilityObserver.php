<?php

namespace App\Observers;

use App\Models\Facility;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class FacilityObserver
{
    /**
     * Handle the Facility "created" event.
     */
    public function created(Facility $facility): void
    {
        $user = Auth::user();

        if (! $user instanceof User) {
            return;
        }

        $user->facilities()->syncWithoutDetaching([$facility->id]);
    }

    /**
     * Handle the Facility "updated" event.
     */
    public function updated(Facility $facility): void
    {
        //
    }

    /**
     * Handle the Facility "deleted" event.
     */
    public function deleted(Facility $facility): void
    {
        //
    }

    /**
     * Handle the Facility "restored" event.
     */
    public function restored(Facility $facility): void
    {
        //
    }

    /**
     * Handle the Facility "force deleted" event.
     */
    public function forceDeleted(Facility $facility): void
    {
        //
    }
}
