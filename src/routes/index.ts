import express from 'express';
import { UserRoutes } from './user.route';
import { ServiceRoutes } from './service.route';
import { TechStackRoutes } from './techstack.route';
import { ProjectRoutes } from './project.route';
import { ContactRoutes } from './contact.route';
import { AIRoutes } from './ai.route';


const router = express.Router();

const moduleRoutes = [
  
  { path: '/auth', route: UserRoutes},
  { path: '/services', route: ServiceRoutes},
  { path: '/techstack', route: TechStackRoutes},
  { path: '/projects', route: ProjectRoutes },
  { path: '/contact', route: ContactRoutes },
  { path: '/ai', route: AIRoutes }
 

];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;