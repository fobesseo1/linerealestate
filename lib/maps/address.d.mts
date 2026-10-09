export function mapAddress(address:string):string;
export function matchCoordinates(query:string, addresses:{roadAddress:string;jibunAddress:string;x:string;y:string}[]):{latitude:number;longitude:number;matchedAddress:string}|null;
