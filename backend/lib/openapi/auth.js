import { loginSchema, registerSchema } from '../schemas';
import { OwnUser, body, ok, registry, route, z } from './registry';

registry.register('RegisterBody', registerSchema);
registry.register('LoginBody', loginSchema);

const Auth = z.object({ token: z.string(), user: OwnUser });

route({
  method: 'post',
  path: '/api/auth/register',
  tags: ['Authentification'],
  summary: 'Créer un compte',
  auth: false,
  request: body(registerSchema),
  responses: { 201: ok(Auth, 'Compte créé') },
  codes: ['LL_VALIDATION_422', 'LL_ZONE_404', 'LL_EMAIL_409'],
});

route({
  method: 'post',
  path: '/api/auth/login',
  tags: ['Authentification'],
  summary: 'Se connecter et obtenir un token',
  auth: false,
  request: body(loginSchema),
  responses: { 200: ok(Auth) },
  codes: ['LL_VALIDATION_422', 'LL_LOGIN_401'],
});

route({
  method: 'get',
  path: '/api/auth/me',
  tags: ['Authentification'],
  summary: "L'utilisateur connecté",
  responses: { 200: ok(z.object({ user: OwnUser })) },
});
