import { useEffect, useState } from "react";

export default function SearchBar({ value, onChange, placeholder = "Search..." }) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 400);
    return () => clearTimeout(timer);
  }, [localValue]);

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      className="border rounded px-3 py-2 flex-1"
    />
  );
}