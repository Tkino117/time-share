import { AbstractRouter } from "./AbstractRouter";
import { EventController } from "../controller/aEventController";

export class EventRouter extends AbstractRouter {
    constructor(private eventController: EventController) {
        super();
        this.initialize();
    }

    protected initializeRoutes(): void {
        this.router.post('/', (req, res) => this.eventController.createEvent(req, res));
        this.router.get('/:eventId', (req, res) => this.eventController.getEvent(req, res));
        this.router.put('/:eventId', (req, res) => this.eventController.updateEvent(req, res));
        this.router.delete('/:eventId', (req, res) => this.eventController.deleteEvent(req, res));
    }
}