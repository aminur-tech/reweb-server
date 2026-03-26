import express from 'express';
import { UserRoutes } from './user.route';
import { ServiceRoutes } from './service.route';
import { TechStackRoutes } from './techstack.route';
import { ProjectRoutes } from './project.route';


const router = express.Router();

const moduleRoutes = [
  
  { path: '/auth', route: UserRoutes},
  { path: '/services', route: ServiceRoutes},
  { path: '/techstack', route: TechStackRoutes},
  { path: '/projects', route: ProjectRoutes }

];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;