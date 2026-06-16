import { redirect } from "next/navigation";

/** Добавление авто — popup на главной; старый URL перенаправляем */
export default function AutoNewPage() {
  redirect("/");
}
