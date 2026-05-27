export class MutatorDefinition {
  constructor(id, displayName, description, apply) {
    this.id = id;
    this.displayName = displayName;
    this.description = description;
    this.apply = apply;
    Object.freeze(this);
  }
}
