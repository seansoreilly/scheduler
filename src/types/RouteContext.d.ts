import "next";

declare module "next" {
  export interface RouteContext {
    params: {
      guid: string;
    };
  }
}