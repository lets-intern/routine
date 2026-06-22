import RoutineApp from "@/components/RoutineApp";
import { PHOTOS } from "@/lib/photos";

// 브라우저에서 Supabase 클라이언트를 생성하므로 정적 프리렌더에서 제외.
export const dynamic = "force-dynamic";

export default function Page() {
  return <RoutineApp photos={PHOTOS} />;
}
