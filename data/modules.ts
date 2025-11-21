// Shared modules data source
// Add new items here with one of the three colors: 'red' | 'green' | 'orange'.
export type ModuleColor = 'red' | 'green' | 'orange';

export type ModuleItem = {
  id: string;
  title: string;
  color: ModuleColor;
};

export const modulesData: ModuleItem[] = [
  { id: 'm1', title: 'Cognitive Psychology essay', color: 'orange' },
  { id: 'm2', title: 'Biological psychology ICT', color: 'red' },
  { id: 'm3', title: 'Research Methods Presentation', color: 'green' },
    { id: 'm4', title: 'social Methods test', color: 'green' },
];
