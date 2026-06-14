export const adminTableStyles = {
  table: {
    style: {
      border: '1px solid #e5e7eb',
    },
  },
  headRow: {
    style: {
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb',
      minHeight: '48px',
    },
  },
  headCells: {
    style: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#6b7280',
      textTransform: 'uppercase',
      paddingLeft: '16px',
      paddingRight: '16px',
      borderLeft: '1px solid #e5e7eb',
      borderRight: '1px solid #e5e7eb',
    },
  },
  rows: {
    style: {
      minHeight: '64px',
      borderBottom: '1px solid #e5e7eb',
      borderLeft: '1px solid #e5e7eb',
      borderRight: '1px solid #e5e7eb',
      '&:hover': {
        backgroundColor: '#f9fafb',
      },
    },
  },
  cells: {
    style: {
      paddingLeft: '16px',
      paddingRight: '16px',
      borderLeft: '1px solid #e5e7eb',
      borderRight: '1px solid #f1f5f9',
    },
  },
};
