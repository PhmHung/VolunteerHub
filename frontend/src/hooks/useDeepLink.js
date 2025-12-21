/** @format */

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const useDeepLink = (dependencies = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setActiveTab, setSelectedEvent, dataList = [] } = dependencies;

  useEffect(() => {
    const tab = searchParams.get("tab");
    const action = searchParams.get("action");
    const id = searchParams.get("id") || searchParams.get("eventId");

    // 1. Chuyển Tab
    if (tab && setActiveTab) {
      setActiveTab(tab);
    }

    // 2. Mở Modal chi tiết
    if (action && id && dataList.length > 0) {
      const target = dataList.find((item) => item._id === id);
      if (target && setSelectedEvent) {
        setSelectedEvent(target);
      }
    }
  }, [searchParams, dataList, setActiveTab, setSelectedEvent]);

  const clearParams = (currentTab) => {
    setSearchParams({ tab: currentTab });
  };

  return { highlightId: searchParams.get("highlight"), clearParams };
};
