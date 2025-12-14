import { apiDelete, apiGet, apiPost, apiPut } from "./client"
import type {
    ApiResponse,
    CreateTemplateRequest,
    RenderTemplateData,
    RenderTemplateRequest,
    Template,
    TemplateListData,
    TemplateStatus,
    UpdateTemplateRequest,
    ChannelType,
} from "@/types/api"

export async function listTemplates(
    page = 1,
    limit = 20,
    status?: TemplateStatus,
    channel?: ChannelType,
): Promise<ApiResponse<TemplateListData>> {
    let url = `/api/v1/templates?page=${String(page)}&limit=${String(limit)}`
    if (status) {
        url += `&status=${status}`
    }
    if (channel) {
        url += `&channel=${channel}`
    }
    return apiGet<TemplateListData>(url)
}

export async function getTemplate(id: string): Promise<ApiResponse<{ template: Template }>> {
    return apiGet<{ template: Template }>(`/api/v1/templates/${id}`)
}

export async function createTemplate(
    data: CreateTemplateRequest,
): Promise<ApiResponse<{ template: Template }>> {
    return apiPost<{ template: Template }>("/api/v1/templates", data)
}

export async function updateTemplate(
    id: string,
    data: UpdateTemplateRequest,
): Promise<ApiResponse<{ template: Template }>> {
    return apiPut<{ template: Template }>(`/api/v1/templates/${id}`, data)
}

export async function deleteTemplate(id: string): Promise<ApiResponse<void>> {
    return apiDelete<void>(`/api/v1/templates/${id}`)
}

export async function publishTemplate(id: string): Promise<ApiResponse<{ template: Template }>> {
    return apiPost<{ template: Template }>(`/api/v1/templates/${id}/publish`)
}

export async function unpublishTemplate(id: string): Promise<ApiResponse<{ template: Template }>> {
    return apiPost<{ template: Template }>(`/api/v1/templates/${id}/unpublish`)
}

export async function archiveTemplate(id: string): Promise<ApiResponse<{ template: Template }>> {
    return apiPost<{ template: Template }>(`/api/v1/templates/${id}/archive`)
}

export async function renderTemplate(
    data: RenderTemplateRequest,
): Promise<ApiResponse<RenderTemplateData>> {
    return apiPost<RenderTemplateData>("/api/v1/templates/render", data)
}
