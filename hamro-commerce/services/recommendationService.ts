import { API_ENDPOINTS } from "../src/constant/api";

type TrackEventPayload = {
  event_type: "view" | "search" | "wishlist_add" | "cart_add" | "purchase" | "category_view";
  product_id?: number | null;
  category_id?: number | null;
  brand?: string | null;
  price?: number | null;
  query?: string | null;
  metadata?: Record<string, unknown>;
};

const VISITOR_KEY = "hc_visitor_id";

const getVisitorId = () => {
  if (typeof window === "undefined") return "";
  const existing = localStorage.getItem(VISITOR_KEY);
  if (existing) return existing;

  const fallbackId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : fallbackId;
  localStorage.setItem(VISITOR_KEY, newId);
  return newId;
};

const buildHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const trackEvent = async (payload: TrackEventPayload) => {
  try {
    const visitorId = getVisitorId();
    await fetch(API_ENDPOINTS.EVENTS_TRACK, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({
        ...payload,
        visitor_id: visitorId,
      }),
    });
  } catch (error) {
    console.warn("Tracking failed", error);
  }
};

export const fetchHomeRecommendations = async (limit = 8) => {
  try {
    const visitorId = getVisitorId();
    const response = await fetch(`${API_ENDPOINTS.RECOMMENDATIONS_HOME}?limit=${limit}`, {
      headers: {
        ...buildHeaders(),
        "X-Visitor-Id": visitorId,
      },
    });
    const result = await response.json();
    return result.data || {};
  } catch (error) {
    console.error("Failed to load home recommendations", error);
    return {};
  }
};

export const fetchProductRecommendations = async (productId: string | number, limit = 8) => {
  try {
    const visitorId = getVisitorId();
    const response = await fetch(`${API_ENDPOINTS.RECOMMENDATIONS_PRODUCT(productId)}?limit=${limit}`, {
      headers: {
        ...buildHeaders(),
        "X-Visitor-Id": visitorId,
      },
    });
    const result = await response.json();
    return result.data || {};
  } catch (error) {
    console.error("Failed to load product recommendations", error);
    return {};
  }
};
