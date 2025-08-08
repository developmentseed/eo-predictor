import { usePassCounter } from "@/hooks/usePassCounter";

interface PassCounterProps {
  mapRef: React.RefObject<any>;
}

export const PassCounter = ({ mapRef }: PassCounterProps) => {
  const { getPassCountText } = usePassCounter({ mapRef });

  return (
    <div className="absolute top-5 left-5 bg-blue-50 px-3 py-2 rounded-md border border-blue-200 shadow-sm">
      <div className="text-sm font-medium text-blue-900">{getPassCountText()}</div>
    </div>
  );
};

