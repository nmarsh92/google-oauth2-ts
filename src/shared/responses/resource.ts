/**
 * Response for a created resource.
 * @template T - The type of the resource identifier.
 */
export interface Resource<T> {
  /**
    * The identifier of the resource.
    */
  id: T;

  /**
   * The version number of the resource.
   */
  version: number;

  /**
   * The creation date and time of the resource in UTC.
   */
  createdAtUtc: Date;
}

/**
 * Represents a resource response.
 *
 * @template T - The type of the resource identifier.
 */
export class ResourceResponse<T> {
  /**
   * The identifier of the resource.
   */
  id: T;

  /**
   * The version number of the resource.
   */
  version: number;

  /**
   * The creation date and time of the resource in UTC.
   */
  createdAtUtc: Date;

  /**
   * Constructs a new ResourceResponse instance.
   * 
   * @param id - The identifier of the resource.
   * @param version - The version number of the resource.
   * @param createdAtUtc - The creation date and time of the resource in UTC.
   */
  constructor(id: T, version: number, createdAtUtc: Date) {
    this.id = id;
    this.version = version;
    this.createdAtUtc = createdAtUtc;
  }
}