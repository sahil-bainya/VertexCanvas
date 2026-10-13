import { useEffect, useState } from "react";
import { adminApi } from "../../services/adminService.js";
import { notify } from "../../utils/toast.jsx";

export function useVisits(active) {
  const [visits, setVisits] = useState([]);
  const [visitStats, setVisitStats] = useState(null);
  const [visitsLoading, setVisitsLoading] = useState(false);

  useEffect(() => {
    if (!active) return;
    let ignore = false;

    (async () => {
      setVisitsLoading(true);
      try {
        const [visitsRes, statsRes] = await Promise.all([
          adminApi.getVisits(),
          adminApi.getVisitStats(),
        ]);
        if (!ignore) {
          setVisits(visitsRes.data.data.visits);
          setVisitStats(statsRes.data.data);
        }
      } catch (err) {
        if (!ignore) notify.error("Failed to load visits");
      } finally {
        if (!ignore) setVisitsLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [active]);

  return { visits, visitStats, visitsLoading };
}