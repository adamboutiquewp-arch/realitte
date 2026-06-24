"use client";

import { useState } from "react";

export default function DeleteCategorieButton({
  id,
  nom,
  action,
}: {
  id: string;
  nom: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const [confirm, setConfirm] = useState(false);

  if (confirm) {
    return (
      <span className="flex items-center gap-2 justify-end">
        <span className="text-[11px] text-[#666]">Supprimer &ldquo;{nom}&rdquo; ?</span>
        <form action={action} className="inline">
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="text-[12px] text-[#E53935] font-bold hover:underline"
          >
            Oui
          </button>
        </form>
        <button
          onClick={() => setConfirm(false)}
          className="text-[12px] text-[#bbb] font-medium hover:text-[#111]"
        >
          Non
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="text-[12px] text-[#bbb] hover:text-[#E53935] font-medium transition-colors"
    >
      Supprimer
    </button>
  );
}
