import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

export function Careers() {
  return (
    <section className="p-8">
      <Link to="/carreras/desarrollo-software">
        <Button variant="secondary" size="sm" icon={<ArrowUpRight size={16} />}>
          Ver plan de estudios
        </Button>
      </Link>
    </section>
  );
}