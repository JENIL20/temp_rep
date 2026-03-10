import api from "../../../shared/api/axios";
import { API } from "../../../shared/api/endpoints";
import { IS_OFFLINE_MODE } from "../../../shared/config";
import { UserPermissions } from "../../auth/types/auth.types";

// ─── Offline mock ────────────────────────────────────────────────────────────
const DUMMY_PERMISSIONS: UserPermissions = {
  COURSES: ["view", "create", "update", "delete"],
  CATEGORIES: ["view", "create", "update", "delete"],
  USERS: ["view", "update"],
  ROLES: ["view", "create", "update", "delete"],
  REPORTS: ["view"],
  ORGANIZATIONS: ["view", "create", "update"],
  GROUPS: ["view", "create", "update", "delete"],
  CERTIFICATES: ["view"],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Safely extract an array from various response shapes */
const toArray = (res: any): any[] => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.items)) return res.items;
  return [];
};

// ─── API ─────────────────────────────────────────────────────────────────────

export const userPermissionsApi = {
  /**
   * Build a full UserPermissions map for the currently-logged-in user.
   *
   * Flow:
   *  1. GET assigned roles for this user       → Role[]
   *  2. For each role GET its module list       → RoleModule[]
   *  3. For each role-module GET assigned perms → Permission[]
   *  4. Merge everything into { moduleCode: permCode[] }
   *
   * @param userId - the logged-in user's ID
   */
  getMyPermissions: async (userId: number): Promise<UserPermissions> => {
    if (IS_OFFLINE_MODE) {
      await new Promise((r) => setTimeout(r, 300));
      return { ...DUMMY_PERMISSIONS };
    }

    try {
      // 1. Roles assigned to this user
      const rolesRes = await api.get(API.USER_PERMISSIONS.USER_ROLES(userId));
      console.log("rolesRes", rolesRes);
      const roles = toArray(rolesRes);
      //   console.log("roles", roles);
      if (roles.length === 0) return {};

      // 2. For every role, fetch its modules AND the assigned permissions per module
      const permMap: UserPermissions = {};

      await Promise.all(
        roles.map(async (roleRaw: any) => {
          const roleId: number = roleRaw.id ?? roleRaw.roleId;
          if (!roleId) return;
          console.log("roleId", roleId);

          try {
            // Modules assigned to this role
            const modulesRes = await api.get(
              API.USER_PERMISSIONS.ROLE_MODULES_BY_ROLE(roleId),
            );
            console.log("modulesRes", modulesRes);
            const roleModules = toArray(modulesRes);
            await Promise.all(
              roleModules.map(async (rm: any) => {
                const moduleId: number = rm.moduleId ?? rm.id;
                // Normalise module code to UPPER_SNAKE (e.g. 'Course Management' → 'COURSE_MANAGEMENT')
                const rawCode: string =
                  rm.moduleCode ?? rm.code ?? `${rm.moduleName}`;
                const moduleCode = rawCode.toUpperCase().replace(/\s+/g, "_");

                if (!moduleId) return;

                try {
                  // Assigned permissions for this role+module
                  const permsRes = await api.get(
                    API.USER_PERMISSIONS.ROLE_MODULE_PERMISSIONS_BY_ROLE_AND_MODULE(
                      roleId,
                      moduleId,
                    ),
                  );
                  const perms = toArray(permsRes);
                  console.log("perms", perms);
                  const codes = perms
                    .map((p: any) =>
                      (p.permissionCode ?? p.code ?? "").toLowerCase(),
                    )
                    .filter(Boolean);

                  // Merge (union) codes across multiple roles
                  if (!permMap[moduleCode]) {
                    permMap[moduleCode] = codes;
                  } else {
                    codes.forEach((c) => {
                      if (!permMap[moduleCode].includes(c)) {
                        permMap[moduleCode].push(c);
                      }
                    });
                  }
                } catch {
                  // No permissions assigned for this role+module — skip silently
                }
              }),
            );
          } catch {
            // Role has no modules — skip silently
          }
        }),
      );
      console.log("permaps", permMap);
      return permMap;
    } catch (error: any) {
      console.error("[userPermissionsApi] getMyPermissions failed:", error);
      // Non-fatal: return empty map — routes will just be inaccessible
      return {};
    }
  },
};
