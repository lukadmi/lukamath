import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Users, BookOpen, MessageSquare, Calendar, Database, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDataExport() {
  const [exportType, setExportType] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filterOptions, setFilterOptions] = useState({ mathLevel: '', status: '' });
  const { toast } = useToast();

  // Fetch summary data for export preview
  const { data: exportSummary } = useQuery({
    queryKey: ['/api/admin/export-summary'],
    refetchInterval: 30000, // Refresh every 30 seconds
  }) as { data?: { students: number; homework: number; contacts: number; progress: number; total: number } };

  const exportMutation = useMutation({
    mutationFn: async (params: {
      type: string;
      dateRange?: { start: string; end: string };
      filters?: any;
    }) => {
      const response = await fetch('/api/admin/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lukamath-${params.type}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Export Successful',
        description: 'Your data has been downloaded successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Export Failed',
        description: error.message || 'Failed to export data',
        variant: 'destructive',
      });
    },
  });

  const handleExport = () => {
    if (!exportType) {
      toast({
        title: 'Selection Required',
        description: 'Please select a data type to export.',
        variant: 'destructive',
      });
      return;
    }

    const params: any = { type: exportType };
    
    if (dateRange.start && dateRange.end) {
      params.dateRange = dateRange;
    }
    
    if (filterOptions.mathLevel || filterOptions.status) {
      params.filters = filterOptions;
    }

    exportMutation.mutate(params);
  };

  const exportOptions = [
    {
      id: 'students',
      title: 'Student Data',
      description: 'Export all student profiles, registration info, and math levels',
      icon: Users,
      count: exportSummary?.students || 0,
    },
    {
      id: 'homework',
      title: 'Homework Records',
      description: 'Export homework assignments, submissions, and grades',
      icon: BookOpen,
      count: exportSummary?.homework || 0,
    },
    {
      id: 'contacts',
      title: 'Contact Forms',
      description: 'Export all contact form submissions and inquiries',
      icon: MessageSquare,
      count: exportSummary?.contacts || 0,
    },
    {
      id: 'progress',
      title: 'Student Progress',
      description: 'Export grade tracking and performance analytics',
      icon: Calendar,
      count: exportSummary?.progress || 0,
    },
    {
      id: 'full-backup',
      title: 'Complete Backup',
      description: 'Export all data for full system backup',
      icon: Database,
      count: exportSummary?.total || 0,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Export & Backup</h1>
          <p className="text-gray-600">Export student data, homework records, and system backups</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Export Type Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Select Data to Export
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exportOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        exportType === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => setExportType(option.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <option.icon className="w-6 h-6 text-blue-600 mr-3" />
                          <div>
                            <h4 className="font-medium text-gray-900">{option.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {option.count}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            {exportType && exportType !== 'full-backup' && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Filter className="w-5 h-5 mr-2" />
                    Export Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date Range (Optional)</Label>
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          placeholder="Start date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        />
                        <Input
                          type="date"
                          placeholder="End date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        />
                      </div>
                    </div>

                    {exportType === 'students' && (
                      <div className="space-y-2">
                        <Label>Math Level Filter</Label>
                        <Select
                          value={filterOptions.mathLevel}
                          onValueChange={(value) => setFilterOptions(prev => ({ ...prev, mathLevel: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All levels" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Levels</SelectItem>
                            <SelectItem value="middle">Middle School Math</SelectItem>
                            <SelectItem value="high-school">High School Math</SelectItem>
                            <SelectItem value="university">University Math</SelectItem>
                            <SelectItem value="sat-act">SAT/ACT Prep</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {exportType === 'homework' && (
                      <div className="space-y-2">
                        <Label>Status Filter</Label>
                        <Select
                          value={filterOptions.status}
                          onValueChange={(value) => setFilterOptions(prev => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Export Summary & Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Export Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {exportSummary && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Students:</span>
                      <Badge variant="outline">{exportSummary.students}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Homework:</span>
                      <Badge variant="outline">{exportSummary.homework}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Contacts:</span>
                      <Badge variant="outline">{exportSummary.contacts}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Progress Records:</span>
                      <Badge variant="outline">{exportSummary.progress}</Badge>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Export Format</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Data will be exported as CSV files that can be opened in Excel or Google Sheets.
                  </p>
                  
                  <Button
                    onClick={handleExport}
                    disabled={!exportType || exportMutation.isPending}
                    className="w-full hover:scale-105 transition-transform"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {exportMutation.isPending ? 'Exporting...' : 'Download Export'}
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Data Security</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>• Exported files contain sensitive student data</p>
                    <p>• Store files securely and delete when no longer needed</p>
                    <p>• Do not share export files via unsecured channels</p>
                    <p>• Regular backups help prevent data loss</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}