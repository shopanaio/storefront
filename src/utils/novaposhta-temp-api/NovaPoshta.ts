import type {
  searchSettlementsProperties,
  searchSettlementsResponse,
  searchSettlementStreetsProperties,
  searchSettlementStreetsResponse,
  getWarehousesProperties,
  getWarehousesResponse,
} from "./NovaPoshta.types";

export class NovaPoshta {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    modelName: string,
    calledMethod: string,
    methodProperties: unknown
  ): Promise<T> {
    try {
      const response = await fetch("https://api.novaposhta.ua/v2.0/json/", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          apiKey: this.apiKey,
          modelName,
          calledMethod,
          methodProperties,
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(`API error: ${result.errors}`);
      }

      return result;
    } catch (error) {
      throw new Error(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  /* --- Online Search --- */
  async searchSettlements(props: searchSettlementsProperties) {
    return this.request<searchSettlementsResponse>(
      "AddressGeneral",
      "searchSettlements",
      props  // actually search by city name
    )
  }


  async searchSettlementStreets(props: searchSettlementStreetsProperties) {
    return this.request<searchSettlementStreetsResponse>(
      "AddressGeneral",
      "searchSettlementStreets",
      props // first need to get settlement Ref and use in this request
    )
  }

  async getWarehouses(props: getWarehousesProperties) {
    return this.request<getWarehousesResponse>(
      "AddressGeneral",
      "getWarehouses",
      props
    )
  }
}
