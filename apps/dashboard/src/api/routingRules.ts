import { apiDelete, apiGet, apiPost, apiPut } from "./client"
import type {
    ApiResponse,
    CreateRoutingRuleRequest,
    RoutingRuleData,
    RoutingRulesListData,
    UpdateRoutingRuleRequest,
} from "@/types/api"

export async function listRoutingRules(
    includeDefaults = true,
): Promise<ApiResponse<RoutingRulesListData>> {
    const params = new URLSearchParams()
    params.set("includeDefaults", String(includeDefaults))
    return apiGet<RoutingRulesListData>(`/api/v1/routing-rules?${params.toString()}`)
}

export async function getRoutingRule(id: string): Promise<ApiResponse<RoutingRuleData>> {
    return apiGet<RoutingRuleData>(`/api/v1/routing-rules/${id}`)
}

export async function createRoutingRule(
    data: CreateRoutingRuleRequest,
): Promise<ApiResponse<RoutingRuleData>> {
    return apiPost<RoutingRuleData>("/api/v1/routing-rules", data)
}

export async function updateRoutingRule(
    id: string,
    data: UpdateRoutingRuleRequest,
): Promise<ApiResponse<RoutingRuleData>> {
    return apiPut<RoutingRuleData>(`/api/v1/routing-rules/${id}`, data)
}

export async function deleteRoutingRule(id: string): Promise<ApiResponse<undefined>> {
    return apiDelete<undefined>(`/api/v1/routing-rules/${id}`)
}

export async function toggleRoutingRule(
    id: string,
    enabled: boolean,
): Promise<ApiResponse<RoutingRuleData>> {
    return apiPut<RoutingRuleData>(`/api/v1/routing-rules/${id}`, { enabled })
}
