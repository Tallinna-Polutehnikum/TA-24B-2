import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { isEditingEnabled } from '../editing';

@Injectable()
export class EditingEnabledGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    if (!isEditingEnabled()) {
      throw new ForbiddenException('Editing endpoints are disabled');
    }

    return true;
  }
}
