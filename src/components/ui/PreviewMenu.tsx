import { FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

interface PreviewMenuProps {
  className?: string;
}

export default function PreviewMenu({
  className,
}: PreviewMenuProps) {
  const navigate = useNavigate();

  const handlePreview = () => {
    navigate("/eventos");
  };

  return (
    <div
      className={`preview-menu-container ${
        className ?? ""
      }`}
    >
      <button
        type="button"
        onClick={handlePreview}
        aria-label="Previsualizar eventos"
        className="preview-menu-button"
      >
        <FiEye className="preview-menu-button__icon" />
        <span>Previsualizar</span>
      </button>
    </div>
  );
}