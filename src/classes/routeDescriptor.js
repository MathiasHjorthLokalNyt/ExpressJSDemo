export class RouteDescriptor{
    constructor(route, httpMethod, description, requirements = "None"){
        this.route = route;
        this.httpMethod = httpMethod;
        this.description = description;
        this.requirements = requirements;
    }
}