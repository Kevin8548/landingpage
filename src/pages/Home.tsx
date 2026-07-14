// import Header from "./Header";

import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

export function Home() {
  return (
    <>
      <div className="flex gap-4 p-8 items-center">
        <Button variant="primary">Más Información</Button>
        <Button variant="secondary" size="sm">Ver detalles</Button>
        <Button variant="outline">Más Información</Button>

        <Badge color="orange">Hackathon</Badge>
        <Badge color="green" withDot>Inscripciones abiertas</Badge>
        <Badge color="neutral">3 eventos este mes</Badge>
      </div>
    </>
  );
}