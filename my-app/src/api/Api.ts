/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface HandlerAddToCartRequest {
  /** @example 120 */
  hb_after?: number;
  /** @example 140 */
  hb_before?: number;
  /** @example 1.75 */
  patient_height?: number;
  /** @example 70 */
  patient_weight?: number;
  /** @example 2.5 */
  surgery_duration?: number;
  /** @example 300 */
  total_blood_loss?: number;
}

export interface HandlerAddToCartResponse {
  bloodlosscalc?: {
    /** @example 5 */
    id?: number;
    /** @example 1.75 */
    patient_height?: number;
    /** @example 70 */
    patient_weight?: number;
    /** @example "черновик" */
    status?: string;
  };
  /** @example true */
  is_new_request?: boolean;
  /** @example "Operation added to bloodlosscalc successfully" */
  message?: string;
  operation?: {
    /** @example 150 */
    avg_blood_loss?: number;
    /** @example 0.04 */
    blood_loss_coeff?: number;
    /** @example 1 */
    id?: number;
    image_url?: string;
    /** @example "Аппендэктомия" */
    title?: string;
  };
  /** @example 1 */
  service_count?: number;
}

export interface HandlerAuthRequest {
  /** @example "admin123" */
  password: string;
  /** @example "admin" */
  username: string;
}

export interface HandlerAuthResponse {
  /** @example "2024-12-11T14:30:00Z" */
  expires_at?: string;
  /** @example "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." */
  token?: string;
  user?: HandlerUserResponse;
}

export interface HandlerBLItem {
  /** @example 150 */
  avg_blood_loss?: number;
  /** @example 0.04 */
  blood_loss_coeff?: number;
  /** @example 120 */
  hb_after?: number;
  /** @example 140 */
  hb_before?: number;
  /** @example 1 */
  operation_id?: number;
  operation_image?: string;
  /** @example "Аппендэктомия" */
  operation_title?: string;
  /** @example 2.5 */
  surgery_duration?: number;
  /** @example 300 */
  total_blood_loss?: number;
}

export interface HandlerBloodlosscalcDetailResponse {
  calculated_count?: number;
  completed_at?: string;
  /** @example "11.12.2024" */
  created_at?: string;
  /** @example "admin" */
  creator?: string;
  formed_at?: string;
  /** @example 5 */
  id?: number;
  items?: HandlerBLItem[];
  moderator?: string;
  /** @example 1.75 */
  patient_height?: number;
  /** @example 70 */
  patient_weight?: number;
  /** @example "черновик" */
  status?: string;
}

export interface HandlerBloodlosscalcResponse {
  calculated_count?: number;
  completed_at?: string;
  /** @example "11.12.2024" */
  created_at?: string;
  /** @example "admin" */
  creator_login?: string;
  formed_at?: string;
  /** @example 5 */
  id?: number;
  moderator_login?: string;
  /** @example 1.75 */
  patient_height?: number;
  /** @example 70 */
  patient_weight?: number;
  /** @example "черновик" */
  status?: string;
}

export interface HandlerCartInfoResponse {
  /** @example 5 */
  current_request_id?: number;
  /** @example 3 */
  service_count?: number;
}

/** Стандартный ответ с ошибкой */
export interface HandlerErrorResponse {
  /** @example "Ошибка авторизации" */
  description?: string;
  /** @example "error" */
  status?: string;
}

/** Стандартный ответ с сообщением */
export interface HandlerMessageResponse {
  /** @example "Операция выполнена успешно" */
  message?: string;
}

export interface HandlerOperation {
  /** @example 150 */
  avg_blood_loss?: number;
  /** @example 0.04 */
  blood_loss_coeff?: number;
  /** @example "Удаление червеобразного отростка" */
  description?: string;
  /** @example 1 */
  id?: number;
  /** @example "http://localhost:9000/blood-loss-images/appendectomy.jpg" */
  image_url?: string;
  /** @example "активна" */
  status?: string;
  /** @example "Аппендэктомия" */
  title?: string;
}

export interface HandlerOperationsListResponse {
  operations?: HandlerOperation[];
}

export interface HandlerRegisterRequest {
  /**
   * @minLength 6
   * @example "password123"
   */
  password: string;
  /**
   * @minLength 3
   * @maxLength 32
   * @example "ivanov"
   */
  username: string;
}

export interface HandlerRegisterResponse {
  /** @example "Пользователь успешно зарегистрирован" */
  message?: string;
  user?: {
    /** @example false */
    is_moderator?: boolean;
    /** @example 1 */
    user_id?: number;
    /** @example "ivanov" */
    username?: string;
  };
}

export interface HandlerUpdateBloodlosscalcRequest {
  /** @example 1.8 */
  patient_height?: number;
  /** @example 75 */
  patient_weight?: number;
}

export interface HandlerUpdateOperationRequest {
  /** @example 110 */
  hb_after?: number;
  /** @example 130 */
  hb_before?: number;
  /** @example 3 */
  surgery_duration?: number;
  /** @example 350 */
  total_blood_loss?: number;
}

export interface HandlerUpdateUserRequest {
  /** @example "new_password123" */
  password?: string;
  /** @example "new_username" */
  username?: string;
}

export interface HandlerUpdateUserResponse {
  /** @example "Профиль успешно обновлен" */
  message?: string;
  user?: HandlerUserResponse;
}

export interface HandlerUserResponse {
  /** @example true */
  is_moderator?: boolean;
  /** @example 1 */
  user_id?: number;
  /** @example "admin" */
  username?: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Blood Loss Calculator API
 * @version 1.0.0
 * @contact
 *
 * Стандартный успешный ответ
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * @description Вход в систему с получением JWT токена
     *
     * @tags Аутентификация
     * @name AuthCreate
     * @summary Аутентификация пользователя
     * @request POST:/api/auth
     */
    authCreate: (credentials: HandlerAuthRequest, params: RequestParams = {}) =>
      this.request<HandlerAuthResponse, HandlerErrorResponse>({
        path: `/api/auth`,
        method: "POST",
        body: credentials,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновление данных операции (гемоглобин, длительность и т.д.)
     *
     * @tags Операции в заявке
     * @name BloodlosscalcOperationsUpdate
     * @summary Обновить операцию в заявке
     * @request PUT:/api/bloodlosscalc_operations
     * @secure
     */
    bloodlosscalcOperationsUpdate: (
      query: {
        /** ID заявки */
        bloodlosscalc_id: number;
        /** ID операции */
        operation_id: number;
      },
      request: HandlerUpdateOperationRequest,
      params: RequestParams = {},
    ) =>
      this.request<HandlerMessageResponse, HandlerErrorResponse>({
        path: `/api/bloodlosscalc_operations`,
        method: "PUT",
        query: query,
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаление операции из заявки (только для черновиков)
     *
     * @tags Операции в заявке
     * @name BloodlosscalcOperationsDelete
     * @summary Удалить операцию из заявки
     * @request DELETE:/api/bloodlosscalc_operations
     * @secure
     */
    bloodlosscalcOperationsDelete: (
      query: {
        /** ID заявки */
        bloodlosscalc_id: number;
        /** ID операции */
        operation_id: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<HandlerMessageResponse, HandlerErrorResponse>({
        path: `/api/bloodlosscalc_operations`,
        method: "DELETE",
        query: query,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Получение списка заявок текущего пользователя с фильтрацией
     *
     * @tags Заявки
     * @name BloodlosscalcsList
     * @summary Получить заявки пользователя
     * @request GET:/api/bloodlosscalcs
     * @secure
     */
    bloodlosscalcsList: (
      query?: {
        /** Фильтр по статусу */
        status?: "черновик" | "сформирована" | "завершена" | "удален";
        /** Дата от (YYYY-MM-DD) */
        date_from?: string;
        /** Дата до (YYYY-MM-DD) */
        date_to?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<HandlerBloodlosscalcResponse[], HandlerErrorResponse>({
        path: `/api/bloodlosscalcs`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Получение детальной информации о заявке со списком операций
     *
     * @tags Заявки
     * @name BloodlosscalcsDetail
     * @summary Получить заявку по ID
     * @request GET:/api/bloodlosscalcs/{id}
     * @secure
     */
    bloodlosscalcsDetail: (id: number, params: RequestParams = {}) =>
      this.request<HandlerBloodlosscalcDetailResponse, HandlerErrorResponse>({
        path: `/api/bloodlosscalcs/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Изменение роста и веса пациента в заявке
     *
     * @tags Заявки
     * @name BloodlosscalcsUpdate
     * @summary Обновить данные заявки
     * @request PUT:/api/bloodlosscalcs/{id}
     * @secure
     */
    bloodlosscalcsUpdate: (
      id: number,
      request: HandlerUpdateBloodlosscalcRequest,
      params: RequestParams = {},
    ) =>
      this.request<HandlerMessageResponse, HandlerErrorResponse>({
        path: `/api/bloodlosscalcs/${id}`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Логическое удаление заявки (статус → "удален")
     *
     * @tags Заявки
     * @name BloodlosscalcsDelete
     * @summary Удалить заявку
     * @request DELETE:/api/bloodlosscalcs/{id}
     * @secure
     */
    bloodlosscalcsDelete: (id: number, params: RequestParams = {}) =>
      this.request<HandlerMessageResponse, HandlerErrorResponse>({
        path: `/api/bloodlosscalcs/${id}`,
        method: "DELETE",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Перевод заявки из статуса "черновик" в "сформирована"
     *
     * @tags Заявки
     * @name BloodlosscalcsFormUpdate
     * @summary Сформировать заявку
     * @request PUT:/api/bloodlosscalcs/{id}/form
     * @secure
     */
    bloodlosscalcsFormUpdate: (id: number, params: RequestParams = {}) =>
      this.request<HandlerMessageResponse, HandlerErrorResponse>({
        path: `/api/bloodlosscalcs/${id}/form`,
        method: "PUT",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Завершение сессии пользователя, токен добавляется в blacklist
     *
     * @tags Аутентификация
     * @name LogoutCreate
     * @summary Выход из системы
     * @request POST:/api/logout
     * @secure
     */
    logoutCreate: (params: RequestParams = {}) =>
      this.request<HandlerMessageResponse, HandlerErrorResponse>({
        path: `/api/logout`,
        method: "POST",
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Получение ID текущей заявки и количества услуг в ней
     *
     * @tags Корзина
     * @name OperationcartList
     * @summary Получить информацию о корзине
     * @request GET:/api/operationcart
     */
    operationcartList: (params: RequestParams = {}) =>
      this.request<HandlerCartInfoResponse, any>({
        path: `/api/operationcart`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Получение списка операций с возможностью фильтрации
     *
     * @tags Операции
     * @name OperationsList
     * @summary Получить список операций
     * @request GET:/api/operations
     */
    operationsList: (
      query?: {
        /** Фильтр по названию операции */
        title?: string;
        /** Фильтр по статусу */
        status?: "активна" | "неактивна";
      },
      params: RequestParams = {},
    ) =>
      this.request<HandlerOperationsListResponse, HandlerErrorResponse>({
        path: `/api/operations`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Получение детальной информации об операции
     *
     * @tags Операции
     * @name OperationsDetail
     * @summary Получить операцию по ID
     * @request GET:/api/operations/{id}
     */
    operationsDetail: (id: number, params: RequestParams = {}) =>
      this.request<HandlerOperation, HandlerErrorResponse>({
        path: `/api/operations/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Добавление операции в текущую заявку пользователя (корзину)
     *
     * @tags Операции
     * @name OperationsAddToBloodlosscalcCreate
     * @summary Добавить операцию в заявку
     * @request POST:/api/operations/{id}/add_to_bloodlosscalc
     * @secure
     */
    operationsAddToBloodlosscalcCreate: (
      id: number,
      request: HandlerAddToCartRequest,
      params: RequestParams = {},
    ) =>
      this.request<HandlerAddToCartResponse, HandlerErrorResponse>({
        path: `/api/operations/${id}/add_to_bloodlosscalc`,
        method: "POST",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Создание учетной записи пользователя
     *
     * @tags Аутентификация
     * @name RegisterCreate
     * @summary Регистрация нового пользователя
     * @request POST:/api/register
     */
    registerCreate: (
      request: HandlerRegisterRequest,
      params: RequestParams = {},
    ) =>
      this.request<HandlerRegisterResponse, HandlerErrorResponse>({
        path: `/api/register`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Получение данных текущего авторизованного пользователя
     *
     * @tags Пользователь
     * @name UserList
     * @summary Получить профиль пользователя
     * @request GET:/api/user
     * @secure
     */
    userList: (params: RequestParams = {}) =>
      this.request<HandlerUserResponse, HandlerErrorResponse>({
        path: `/api/user`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Изменение данных пользователя (имя, пароль)
     *
     * @tags Пользователь
     * @name UserUpdate
     * @summary Обновить профиль пользователя
     * @request PUT:/api/user
     * @secure
     */
    userUpdate: (
      request: HandlerUpdateUserRequest,
      params: RequestParams = {},
    ) =>
      this.request<HandlerUpdateUserResponse, HandlerErrorResponse>({
        path: `/api/user`,
        method: "PUT",
        body: request,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
