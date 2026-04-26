import { Router } from "express";
import { SprintController } from "../controller/sprint.controller";
import { container } from "../di/inversify.config";
import { TYPES } from "../di/types";
import { ENDPOINTS } from "../constants/endpoints";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkPermission } from "../middleware/permission.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import { CreateSprintRequestSchema, GetSprintRequestSchema, UpdateSprintRequestSchema, SprintIdParamSchema } from "../dto/sprint.dto";

const sprintController = container.get<SprintController>(TYPES.SprintController);

export class SprintRouter {
    public router: Router;

    constructor() {
        this.router = Router();
        this._initializeRoutes();
    }

    private _initializeRoutes(): void {
        // Create
        this.router.post(
            ENDPOINTS.SPRINTS.ROOT,
            authMiddleware,
            checkPermission('sprint:create'),
            validateRequest(CreateSprintRequestSchema),
            sprintController.createSprint
        );

        // List
        this.router.get(
            ENDPOINTS.SPRINTS.ROOT,
            authMiddleware,
            checkPermission(['sprint:view:all', 'sprint:create']),
            validateRequest(GetSprintRequestSchema),
            sprintController.getSprints
        );

        // Get By Id
        this.router.get(
            "/:sprintId",
            authMiddleware,
            checkPermission(['sprint:view:all', 'sprint:create']),
            validateRequest(SprintIdParamSchema),
            sprintController.getSprintById
        );

        // Update (handles Start/Complete too)
        this.router.patch(
            "/:sprintId",
            authMiddleware,
            checkPermission(['sprint:update', 'sprint:start', 'sprint:complete']),
            validateRequest(UpdateSprintRequestSchema),
            sprintController.updateSprint
        );

        // Delete
        this.router.delete(
            "/:sprintId",
            authMiddleware,
            checkPermission('sprint:delete'),
            validateRequest(SprintIdParamSchema),
            sprintController.deleteSprint
        );
    }
}