import { useState, useMemo } from 'react';
import {
  Plus,
  ChevronUp,
  ChevronDown,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import usePortfolioStore from '../stores/portfolio';
import { formatCurrency, formatPercent, sortPositions } from '../lib/utils';
import Header from '../components/Header';
import AddPositionModal from '../components/AddPositionModal';
import AboutModal from '../components/AboutModal';

export default function Positions() {
  const {
    positions,
    addPosition,
    updatePosition,
    deletePosition,
    duplicatePosition,
    saveSnapshot,
  } = usePortfolioStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedIds, setSelectedIds] = useState(new Set());

  const sortedPositions = useMemo(() => {
    return sortPositions(positions, sortField, sortDirection);
  }, [positions, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSavePosition = (positionData) => {
    if (editingPosition) {
      updatePosition(editingPosition.id, positionData);
    } else {
      addPosition(positionData);
    }
    setEditingPosition(null);
  };

  const handleEditPosition = (position) => {
    setEditingPosition(position);
    setIsModalOpen(true);
  };

  const handleDeletePosition = (id) => {
    if (confirm('Are you sure you want to delete this position?')) {
      deletePosition(id);
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPosition(null);
  };

  const handleSnapshot = () => {
    saveSnapshot();
    alert('Snapshot saved!');
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === positions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(positions.map((p) => p.id)));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <span className="w-4 h-4 opacity-0 group-hover:opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const columns = [
    { key: 'checkbox', label: '', sortable: false, width: '40px' },
    { key: 'id', label: 'Id', sortable: true, width: '60px' },
    { key: 'name', label: 'Position', sortable: true, width: '180px' },
    { key: 'chain', label: 'Chain', sortable: true, width: '100px' },
    { key: 'protocol', label: 'Protocol', sortable: true, width: '120px' },
    { key: 'type', label: 'Type', sortable: true, width: '100px' },
    { key: 'value', label: 'Actual Value', sortable: true, width: '120px', align: 'right' },
    { key: 'token0', label: 'Asset 1', sortable: true, width: '80px' },
    { key: 'token1', label: 'Asset 2', sortable: true, width: '80px' },
    { key: 'monthlyFees', label: 'Fees', sortable: true, width: '100px', align: 'right' },
    { key: 'debt', label: 'Debt', sortable: true, width: '100px', align: 'right' },
    { key: 'apr', label: 'APR %', sortable: true, width: '80px', align: 'right' },
    { key: 'exposure', label: 'Exposure', sortable: true, width: '120px' },
    { key: 'nftId', label: 'Linked to', sortable: true, width: '100px' },
    { key: 'actions', label: 'Actions', sortable: false, width: '120px' },
  ];

  // Extract numeric id from position id (e.g., "1" from "1" or "pos_1")
  const getNumericId = (position, index) => {
    const match = position.id?.match(/\d+/);
    return match ? parseInt(match[0]) : index + 1;
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header onSnapshot={handleSnapshot} onAbout={() => setIsAboutOpen(true)} />

      <main className="max-w-[1600px] mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary mb-1">Positions</h1>
            <p className="text-text-tertiary text-sm">
              {positions.length} total positions
              {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg font-medium hover:bg-accent-blue/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Position
          </button>
        </div>

        {/* Positions Table */}
        {positions.length === 0 ? (
          <div className="bg-bg-secondary rounded-xl border border-border-primary p-8 text-center">
            <p className="text-text-secondary mb-2">No positions yet</p>
            <p className="text-text-tertiary text-sm">Add your first position to start tracking</p>
          </div>
        ) : (
          <div className="bg-bg-secondary rounded-xl border border-border-primary overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-bg-tertiary/50 border-b border-border-primary">
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        style={{ width: column.width }}
                        className={`
                          px-3 py-3 text-xs font-semibold text-text-tertiary uppercase tracking-wider
                          ${column.align === 'right' ? 'text-right' : 'text-left'}
                          ${column.sortable ? 'cursor-pointer hover:text-text-secondary select-none group' : ''}
                        `}
                        onClick={() => column.sortable && handleSort(column.key)}
                      >
                        {column.key === 'checkbox' ? (
                          <input
                            type="checkbox"
                            checked={selectedIds.size === positions.length && positions.length > 0}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 rounded border-border-primary bg-bg-primary cursor-pointer"
                          />
                        ) : (
                          <div className={`flex items-center gap-1 ${column.align === 'right' ? 'justify-end' : ''}`}>
                            {column.label}
                            {column.sortable && <SortIcon field={column.key} />}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedPositions.map((position, index) => (
                    <tr
                      key={position.id}
                      className="border-b border-border-secondary hover:bg-bg-tertiary/30 transition-colors"
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(position.id)}
                          onChange={() => toggleSelect(position.id)}
                          className="w-4 h-4 rounded border-border-primary bg-bg-primary cursor-pointer"
                        />
                      </td>

                      {/* Id */}
                      <td className="px-3 py-3 text-sm text-text-secondary font-mono">
                        {getNumericId(position, index)}
                      </td>

                      {/* Position Name */}
                      <td className="px-3 py-3">
                        <div className="text-sm font-medium text-text-primary">{position.name}</div>
                      </td>

                      {/* Chain */}
                      <td className="px-3 py-3">
                        <span className="text-sm text-text-secondary capitalize">{position.chain}</span>
                      </td>

                      {/* Protocol */}
                      <td className="px-3 py-3">
                        <span className="text-sm text-text-secondary capitalize">
                          {position.protocol?.replace(/-/g, ' ')}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="px-3 py-3">
                        <span className="text-sm text-text-secondary capitalize">{position.type}</span>
                      </td>

                      {/* Actual Value */}
                      <td className="px-3 py-3 text-right">
                        <span className="text-sm font-mono text-text-primary font-medium">
                          {formatCurrency(position.value)}
                        </span>
                      </td>

                      {/* Asset 1 */}
                      <td className="px-3 py-3">
                        <span className="text-sm font-mono text-text-secondary">
                          {position.token0 || '-'}
                        </span>
                      </td>

                      {/* Asset 2 */}
                      <td className="px-3 py-3">
                        <span className="text-sm font-mono text-text-secondary">
                          {position.token1 || '-'}
                        </span>
                      </td>

                      {/* Fees */}
                      <td className="px-3 py-3 text-right">
                        <span className="text-sm font-mono text-accent-green">
                          {formatCurrency(position.monthlyFees || 0)}
                        </span>
                      </td>

                      {/* Debt */}
                      <td className="px-3 py-3 text-right">
                        <span className={`text-sm font-mono ${position.debt > 0 ? 'text-accent-red' : 'text-text-tertiary'}`}>
                          {position.debt > 0 ? formatCurrency(position.debt) : '$0.00'}
                        </span>
                      </td>

                      {/* APR */}
                      <td className="px-3 py-3 text-right">
                        <span className={`text-sm font-mono ${position.apr > 20 ? 'text-accent-green' : 'text-text-secondary'}`}>
                          {formatPercent(position.apr)}
                        </span>
                      </td>

                      {/* Exposure */}
                      <td className="px-3 py-3">
                        <span className="text-sm text-text-secondary">{position.exposure || '-'}</span>
                      </td>

                      {/* Linked to (NFT ID) */}
                      <td className="px-3 py-3">
                        {position.nftId ? (
                          <a
                            href={`https://app.uniswap.org/pools/${position.nftId}?chain=${position.chain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-accent-blue hover:underline flex items-center gap-1"
                          >
                            {position.nftId}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-sm text-text-tertiary">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => handleEditPosition(position)}
                            className="p-1.5 hover:bg-bg-tertiary rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4 text-text-tertiary hover:text-text-primary" />
                          </button>
                          <button
                            onClick={() => duplicatePosition(position.id)}
                            className="p-1.5 hover:bg-bg-tertiary rounded transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4 text-text-tertiary hover:text-text-primary" />
                          </button>
                          <button
                            onClick={() => handleDeletePosition(position.id)}
                            className="p-1.5 hover:bg-accent-red/10 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-text-tertiary hover:text-accent-red" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* Summary Footer */}
                <tfoot>
                  <tr className="bg-bg-tertiary/50 font-medium">
                    <td colSpan={2} className="px-3 py-3 text-sm text-text-secondary">
                      Total
                    </td>
                    <td colSpan={4} className="px-3 py-3 text-sm text-text-tertiary">
                      {positions.length} positions
                    </td>
                    <td className="px-3 py-3 text-right text-sm font-mono text-text-primary font-semibold">
                      {formatCurrency(positions.reduce((sum, p) => sum + (p.value || 0), 0))}
                    </td>
                    <td colSpan={2}></td>
                    <td className="px-3 py-3 text-right text-sm font-mono text-accent-green font-semibold">
                      {formatCurrency(positions.reduce((sum, p) => sum + (p.monthlyFees || 0), 0))}
                    </td>
                    <td className="px-3 py-3 text-right text-sm font-mono text-accent-red font-semibold">
                      {formatCurrency(positions.reduce((sum, p) => sum + (p.debt || 0), 0))}
                    </td>
                    <td colSpan={4}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Position Modal */}
      <AddPositionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSavePosition}
        editPosition={editingPosition}
      />

      {/* About Modal */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}
