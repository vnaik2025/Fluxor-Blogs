import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage;
    try {
      // Try to parse as JSON first
      const data = await res.json();
      errorMessage = data.message || res.statusText;
    } catch (e) {
      // If not JSON, get as text
      try {
        errorMessage = await res.text();
      } catch (e2) {
        errorMessage = res.statusText;
      }
    }
    throw new Error(errorMessage || `Error ${res.status}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    // Use absolute HTTP URLs (same as getQueryFn)
    const baseUrl = window.location.origin;
    const urlPath = url.startsWith('/') ? url : `/${url}`;
    const fullUrl = `${baseUrl}${urlPath}`;
    
    console.log(`API request (${method} ${fullUrl})`);

    // Use a custom replacer function for JSON.stringify to add "_isDate" flag to Date objects
    // This helps the server identify which fields should be converted back to Date objects
    const replacer = (key: string, value: any) => {
      if (value instanceof Date) {
        return {
          _isDate: true,
          value: value.toISOString()
        };
      }
      return value;
    };
    
    const res = await fetch(fullUrl, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data, replacer) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API request error (${method} ${url}):`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      // Use absolute HTTP URLs
      const urlPath = queryKey[0] as string;
      const baseUrl = window.location.origin;
      const fullUrl = `${baseUrl}${urlPath.startsWith('/') ? urlPath : `/${urlPath}`}`;
      console.log("Fetching from:", fullUrl);
      const res = await fetch(fullUrl, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      
      // Parse the JSON, but handle empty responses
      if (res.headers.get("content-length") === "0") {
        return null;
      }
      
      return await res.json();
    } catch (error) {
      console.error("API request error:", error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
