import React, { useState, useEffect } from 'react';
import {
  AccessControlConditions,
  AccsDefaultParams,
  AccsOperatorParams,
} from '@lit-protocol/types';
import { AccessControlCondition } from '@/types';
import { isConditionsGroup, isNormalCondition, isOperatorCondition } from '@/utils/type-checker';
import { Button, ButtonGroup } from '@heroui/button';
import { DEFAULT_CONDITION } from '@/utils/constants';
import NormalCondition from './normal-condition';

const OPERATOR_OPTIONS = [
  { label: 'AND', value: 'and' },
  { label: 'OR', value: 'or' },
];

const DEFAULT_OPERATOR: AccsOperatorParams = {
  operator: 'and'
};

interface AccessControlConditionsEditorProps {
  value: AccessControlConditions;
  onChange: (conditions: AccessControlConditions) => void;
}

const AccessControlConditionsEditor: React.FC<AccessControlConditionsEditorProps> = ({
  value,
  onChange
}) => {
  const [conditions, setConditions] = useState<AccessControlConditions>(value || []);

  useEffect(() => {
    setConditions(value || []);
  }, [value]);

  const updateConditions = (updatedConditions: AccessControlConditions) => {
    setConditions(updatedConditions);
    onChange(updatedConditions);
  };

  const addCondition = (parentPath: number[] = [], condition: AccsDefaultParams = DEFAULT_CONDITION) => {
    const newConditions = [...conditions];
    let current = newConditions;

    for (const index of parentPath) {
      current = current[index] as AccessControlConditions;
    }

    current.push({ ...condition });
    updateConditions(newConditions);
  };

  const addOperator = (parentPath: number[] = []) => {
    const newConditions = [...conditions];
    let current = newConditions;

    // 导航到正确的嵌套级别
    for (const index of parentPath) {
      current = current[index] as AccessControlConditions;
    }

    current.push({ ...DEFAULT_OPERATOR });
    updateConditions(newConditions);
  };

  const addGroup = (parentPath: number[] = []) => {
    const newConditions = [...conditions];
    let current = newConditions;

    for (const index of parentPath) {
      current = current[index] as AccessControlConditions;
    }

    current.push([]);
    updateConditions(newConditions);
  };

  const removeItem = (path: number[]) => {
    const newConditions = [...conditions];

    if (path.length === 1) {
      newConditions.splice(path[0], 1);
    } else {
      const parentPath = path.slice(0, -1);
      const index = path[path.length - 1];

      let parent = newConditions;
      for (const idx of parentPath) {
        parent = parent[idx] as AccessControlConditions;
      }

      parent.splice(index, 1);
    }

    updateConditions(newConditions);
  };

  const updateItem = (path: number[], value: AccessControlCondition) => {
    const newConditions = [...conditions];

    if (path.length === 1) {
      newConditions[path[0]] = value;
    } else {
      const parentPath = path.slice(0, -1);
      const index = path[path.length - 1];

      let parent = newConditions;
      for (const idx of parentPath) {
        parent = parent[idx] as AccessControlConditions;
      }

      parent[index] = value;
    }

    updateConditions(newConditions);
  };

  const renderConditionGroup = (group: AccessControlConditions, path: number[] = []) => {
    return (
      <div style={{
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '10px',
        margin: '10px 0',
        backgroundColor: '#f9f9f9'
      }}>
        {group.length === 0 ? (
          <div>Empty - Add any ondition</div>
        ) : (
          group.map((item, index) => {
            const currentPath = [...path, index];

            if (isOperatorCondition(item)) {
              return (
                <div key={index} style={{ margin: '8px 0' }}>
                  <select
                    value={item.operator}
                    onChange={(e) => updateItem(currentPath, { operator: e.target.value })}
                    style={{ padding: '5px', borderRadius: '3px' }}
                  >
                    {OPERATOR_OPTIONS.map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                  <Button onPress={() => removeItem(currentPath)}>
                    Remove
                  </Button>
                </div>
              );
            } else if (isNormalCondition(item)) {
              return (
                <NormalCondition
                  key={index}
                  condition={item}
                  updateCondition={(newCondition) => updateItem(currentPath, newCondition)} />
              );
            } else if (isConditionsGroup(item)) {
              return (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4>Condition Group</h4>
                    <Button onPress={() => removeItem(currentPath)}>Remove group</Button>
                  </div>
                  {renderConditionGroup(item, currentPath)}
                </div>
              );
            }
            return null;
          })
        )}

        {/* <div className="condition-buttons" style={{
          display: 'flex',
          gap: '10px',
          marginTop: '10px'
        }}>
          <ButtonGroup>
            <Button onPress={() => addCondition(path)}>Add condition</Button>
            <Button onPress={() => addOperator(path)}>Add operator</Button>
            <Button onPress={() => addGroup(path)}>Add condition group</Button>
          </ButtonGroup>
        </div> */}
      </div >
    );
  };

  return (
    <div>
      <h3>Access Control Conditions</h3>
      {conditions.length === 0 ? (
        <div>
          <p>No condition set.</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <ButtonGroup>
              <Button onPress={() => addCondition()}>Add condition</Button>
              <Button onPress={() => addOperator()}>Add operator</Button>
              <Button onPress={() => addGroup()}>Add condition group</Button>
            </ButtonGroup>
          </div>
        </div>
      ) : (
        renderConditionGroup(conditions)
      )}

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
        <h4>Current conditions JSON:</h4>
        <pre style={{ overflow: 'auto', maxHeight: '200px' }}>
          {JSON.stringify(conditions, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default AccessControlConditionsEditor;
