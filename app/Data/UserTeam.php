<?php

namespace App\Data;

readonly class UserTeam
{
    public function __construct(
        public int $id,
        public string $name,
        public string $slug,
        public bool $isPersonal,
        public ?string $role,
        public ?string $roleLabel,
        public ?string $email = null,
        public ?string $address = null,
        public ?string $mobile = null,
        public ?string $phone = null,
        public ?bool $isCurrent = null,
    ) {
        //
    }
}
