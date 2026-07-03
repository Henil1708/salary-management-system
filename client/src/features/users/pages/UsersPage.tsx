import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/store/types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { TableSkeleton } from '@/shared/components/feedback/skeletons';
import { formatDate } from '@/shared/utils/format';
import { fetchUsers, getHrUsers, getHrUsersLoading } from '@/features/users';
import { AddUserDialog } from '../components/AddUserDialog';

const UsersPage = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const users = useAppSelector(getHrUsers);
  const loading = useAppSelector(getHrUsersLoading);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    void dispatch(fetchUsers());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('users.title')}</h1>
          <p className="mt-0.5 text-muted-foreground">{t('users.subtitle')}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          {t('users.addUser')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('users.title')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && users.length === 0 ? (
            <TableSkeleton rows={4} columns={4} />
          ) : users.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">{t('users.empty')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('users.columns.name')}</TableHead>
                  <TableHead>{t('users.columns.email')}</TableHead>
                  <TableHead>{t('users.columns.designation')}</TableHead>
                  <TableHead>{t('users.columns.joined')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((hrUser) => (
                  <TableRow key={hrUser.id}>
                    <TableCell className="font-medium">{hrUser.username}</TableCell>
                    <TableCell className="text-muted-foreground">{hrUser.email}</TableCell>
                    <TableCell>{hrUser.designation}</TableCell>
                    <TableCell>{formatDate(hrUser.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddUserDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default UsersPage;
