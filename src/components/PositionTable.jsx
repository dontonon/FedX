import { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Trash2,
  Copy,
  ExternalLink,
  AlertTriangle,
  TrendingUp,
  Zap,
  Edit2,
} from 'lucide-react';
import { formatCurrency, formatPercent, getChainInfo, getPositionTypeInfo, getPositionRecommendation, sortPositions } from '../lib/utils';

// Inline editable cell component
function EditableCell({ value, type = 'number', onSave, format, className = '' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toString() || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setEditValue(value?.toString() || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    const newValue = type === 'number' ? parseFloat(editValue) || 0 : editValue;
    onSave(newValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value?.toString() || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        step={type === 'number' ? '0.01' : undefined}
        className="w-24 px-2 py-1 bg-bg-tertiary border border-accent-blue rounded text-text-primary font-mono text-sm focus:outline-none"
      />
    );
  }

  return (
    <span
      onDoubleClick={handleDoubleClick}
      className={`cursor-pointer hover:bg-bg-tertiary/50 px-2 py-1 rounded transition-colors border border-transparent hover:border-border-primary ${className}`}
      title="Double-click to edit"
    >
      {format ? format(value) : value}
    </span>
  );
}

export default function PositionTable({ positions, onEdit, onDelete, onDuplicate, onUpdateField }) {
  const [sortField, setSortField] = useState('value');
  const [sortDirection, setSortDirection] = useState('desc');
  const [expandedRow, setExpandedRow] = useState(null);

  const sortedPositions = useMemo(() => {
    return sortPositions(positions, sortField, sortDirection);
  }, [positions, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleFieldUpdate = (positionId, field, value) => {
    if (onUpdateField) {
      onUpdateField(positionId, { [field]: value });
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <span className="w-4 h-4" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  const renderRecommendation = (position) => {
    const rec = getPositionRecommendation(position);
    if (!rec) return null;

    const colors = {
      success: 'text-accent-green bg-accent-green/10',
      warning: 'text-accent-yellow bg-accent-yellow/10',
      danger: 'text-accent-red bg-accent-red/10',
    };

    const icons = {
      success: TrendingUp,
      warning: AlertTriangle,
      danger: Zap,
    };

    const Icon = icons[rec.type];

    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${colors[rec.type]}`}>
        <Icon className="w-3 h-3" />
        <span>{rec.text}</span>
      </div>
    );
  };

  const columns = [
    { key: 'name', label: 'Position', sortable: true },
    { key: 'chain', label: 'Chain', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'value', label: 'Value', sortable: true, align: 'right' },
    { key: 'apr', label: 'APR', sortable: true, align: 'right' },
    { key: 'monthlyFees', label: 'Monthly', sortable: true, align: 'right' },
    { key: 'recommendation', label: 'Status', sortable: false },
    { key: 'actions', label: '', sortable: false, align: 'right' },
  ];

  if (positions.length === 0) {
    return (
      <div className="bg-bg-secondary rounded-xl border border-border-primary p-8 text-center">
        <p className="text-text-secondary mb-2">No positions yet</p>
        <p className="text-text-tertiary text-sm">Add your first position to start tracking</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary rounded-xl border border-border-primary overflow-hidden">
      {/* Hint for inline editing */}
      <div className="px-4 py-2 bg-bg-tertiary/50 border-b border-border-secondary">
        <p className="text-xs text-text-tertiary">
          Double-click <span className="text-accent-blue">Value</span>, <span className="text-accent-blue">APR</span>, or <span className="text-accent-blue">Monthly</span> to edit inline (like a spreadsheet)
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-primary">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-4 py-3 text-xs font-medium text-text-tertiary uppercase tracking-wider
                    ${column.align === 'right' ? 'text-right' : 'text-left'}
                    ${column.sortable ? 'cursor-pointer hover:text-text-secondary select-none' : ''}
                  `}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className={`flex items-center gap-1 ${column.align === 'right' ? 'justify-end' : ''}`}>
                    {column.label}
                    {column.sortable && <SortIcon field={column.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedPositions.map((position) => {
              const chainInfo = getChainInfo(position.chain);
              const typeInfo = getPositionTypeInfo(position.type);
              const isExpanded = expandedRow === position.id;

              return (
                <tr
                  key={position.id}
                  className="border-b border-border-secondary table-row-hover"
                >
                  {/* Position Name */}
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-text-primary">{position.name}</div>
                      <div className="text-xs text-text-tertiary">{position.protocol}</div>
                    </div>
                  </td>

                  {/* Chain */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: chainInfo.color }}
                      />
                      <span className="text-sm text-text-secondary">{chainInfo.label}</span>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-1 rounded-md text-xs font-medium"
                      style={{
                        backgroundColor: `${typeInfo.color}20`,
                        color: typeInfo.color,
                      }}
                    >
                      {typeInfo.label}
                    </span>
                  </td>

                  {/* Value - Editable */}
                  <td className="px-4 py-3 text-right">
                    <div className="font-mono font-medium text-text-primary">
                      <EditableCell
                        value={position.value}
                        type="number"
                        onSave={(val) => handleFieldUpdate(position.id, 'value', val)}
                        format={formatCurrency}
                      />
                    </div>
                    {position.debt > 0 && (
                      <div className="font-mono text-xs text-accent-red mt-1">
                        <EditableCell
                          value={position.debt}
                          type="number"
                          onSave={(val) => handleFieldUpdate(position.id, 'debt', val)}
                          format={(v) => `-${formatCurrency(v)} debt`}
                          className="text-accent-red"
                        />
                      </div>
                    )}
                  </td>

                  {/* APR - Editable */}
                  <td className="px-4 py-3 text-right">
                    <EditableCell
                      value={position.apr}
                      type="number"
                      onSave={(val) => handleFieldUpdate(position.id, 'apr', val)}
                      format={formatPercent}
                      className={`font-mono ${position.apr > 20 ? 'text-accent-green' : 'text-text-secondary'}`}
                    />
                  </td>

                  {/* Monthly Fees - Editable */}
                  <td className="px-4 py-3 text-right">
                    <EditableCell
                      value={position.monthlyFees}
                      type="number"
                      onSave={(val) => handleFieldUpdate(position.id, 'monthlyFees', val)}
                      format={formatCurrency}
                      className="font-mono text-accent-green"
                    />
                  </td>

                  {/* Recommendation */}
                  <td className="px-4 py-3">
                    {renderRecommendation(position)}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <div className="relative">
                      <button
                        onClick={() => setExpandedRow(isExpanded ? null : position.id)}
                        className="p-1 hover:bg-bg-tertiary rounded transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-text-tertiary" />
                      </button>

                      {isExpanded && (
                        <div className="absolute right-0 top-8 z-10 bg-bg-elevated border border-border-primary rounded-lg shadow-xl py-1 min-w-[140px]">
                          <button
                            onClick={() => {
                              onEdit?.(position);
                              setExpandedRow(null);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit All Fields
                          </button>
                          <button
                            onClick={() => {
                              onDuplicate?.(position.id);
                              setExpandedRow(null);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                          >
                            <Copy className="w-4 h-4" />
                            Duplicate
                          </button>
                          {position.nftId && (
                            <a
                              href={`https://app.uniswap.org/pools/${position.nftId}?chain=${position.chain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View on Uniswap
                            </a>
                          )}
                          <hr className="my-1 border-border-primary" />
                          <button
                            onClick={() => {
                              onDelete?.(position.id);
                              setExpandedRow(null);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-accent-red hover:bg-accent-red/10"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* Summary row */}
          <tfoot>
            <tr className="bg-bg-tertiary/50">
              <td colSpan={3} className="px-4 py-3 text-sm font-medium text-text-secondary">
                Total ({positions.length} positions)
              </td>
              <td className="px-4 py-3 text-right font-mono font-semibold text-text-primary">
                {formatCurrency(positions.reduce((sum, p) => sum + (p.value || 0), 0))}
              </td>
              <td className="px-4 py-3 text-right font-mono text-text-tertiary">
                —
              </td>
              <td className="px-4 py-3 text-right font-mono font-semibold text-accent-green">
                {formatCurrency(positions.reduce((sum, p) => sum + (p.monthlyFees || 0), 0))}
              </td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
