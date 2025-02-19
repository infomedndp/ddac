export interface FormField {
  id: string;
  type: 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  value: string;
  pageIndex: number;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
}
