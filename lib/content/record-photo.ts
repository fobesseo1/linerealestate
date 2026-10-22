import config from "./public-config.json";
import {publicBucket} from "./client";
import type {DealRecord} from "./types";

/** Public URL of a record's store photo. The version query makes a replaced photo show immediately. */
export const recordPhotoUrl=(r:Pick<DealRecord,"photo_path"|"updated_at">)=>`${config.url}/storage/v1/object/public/${publicBucket}/${r.photo_path}?v=${encodeURIComponent(r.updated_at)}`;
