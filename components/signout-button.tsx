"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <Button type="submit" variant="ghost" size="sm">
        <LogOut className="mr-2 h-4 w-4" />
        Sair
      </Button>
    </form>
  );
}
