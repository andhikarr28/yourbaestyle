"use server";

import { revalidatePath } from "next/cache";
import { createKnowledgeItem, updateKnowledgeItem, deleteKnowledgeItem } from "@/services/knowledge-service";
import type { Knowledge } from "@/types";

export async function createItemAction(data: Omit<Knowledge, "id" | "createdAt" | "updatedAt">) {
  try {
    await createKnowledgeItem(data);
    revalidatePath("/admin");
    revalidatePath("/knowledge");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create item." };
  }
}

export async function updateItemAction(id: string, data: Partial<Omit<Knowledge, "id" | "createdAt">>) {
  try {
    await updateKnowledgeItem(id, data);
    revalidatePath("/admin");
    revalidatePath("/knowledge");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update item." };
  }
}

export async function deleteItemAction(id: string) {
  try {
    await deleteKnowledgeItem(id);
    revalidatePath("/admin");
    revalidatePath("/knowledge");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete item." };
  }
}
