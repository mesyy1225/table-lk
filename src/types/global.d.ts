
import { Product } from "@/lib/data";

declare global {
  interface Window {
    products?: Product[];
  }
}
