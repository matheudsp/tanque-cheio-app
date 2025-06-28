import { Loading } from "@/components/ui/Loading";
import { useSession } from "@/hooks/useSession";


export default function Index() {
  useSession();

  return <Loading key={"initalizer-app-loading"} />;
}
