import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleNodeComponent } from './rule-node-component';
import { defaultValue, emptyRoot, FieldDataTypes, isDataType } from 'src/app/shared/models/constant';
import { RuleNodeType } from '@proxy/common/enums/rule-node-type.enum';

describe('RuleNodeComponent', () => {
  let component: RuleNodeComponent;
  let fixture: ComponentFixture<RuleNodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuleNodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RuleNodeComponent);
    fixture.componentRef.setInput('node', emptyRoot());
    fixture.componentRef.setInput('fields', [{ key: 'age', label: 'Age', dataType: 'Number' }]);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('accepts lookup options for nested rule nodes', () => {
    const lookups = { statuses: [{ id: 'active', name: 'Active' }] };
    fixture.componentRef.setInput('lookups', lookups);
    fixture.detectChanges();

    expect(component.lookups()).toEqual(lookups);
  });

  it('adds a condition using the first available field', () => {
    component.addCondition();

    expect(component.node().children).toEqual([
      {
        nodeType: 2,
        logicalJoinOperator: 1,
        fieldKey: 'age',
        operator: 1,
        value: null,
        children: [],
      },
    ]);
  });

  it('adds new conditions before existing subgroups', () => {
    const group = {
      nodeType: RuleNodeType.Group,
      logicalOperator: 1,
      logicalJoinOperator: 1,
      children: [],
    };
    fixture.componentRef.setInput('node', { ...emptyRoot(), children: [group] });

    component.addCondition();

    expect(component.node().children?.[0].nodeType).toBe(RuleNodeType.Condition);
    expect(component.node().children?.[1]).toEqual(group);
  });

  it('adds and removes nested groups without confusing them with field data types', () => {
    component.addGroup();
    expect(component.node().children?.[0]).toEqual({
      nodeType: 1,
      logicalOperator: 1,
      logicalJoinOperator: 1,
      children: [],
    });

    component.removeChild(0);
    expect(component.node().children).toEqual([]);
  });

  it('preserves group node types when updating a child', () => {
    const group = {
      nodeType: 1,
      logicalOperator: 1,
      logicalJoinOperator: 1,
      children: [],
    };
    const condition = {
      nodeType: 2,
      fieldKey: 'age',
      operator: 1,
      value: 10,
      children: [],
    };
    fixture.componentRef.setInput('node', { ...emptyRoot(), children: [condition, group] });

    component.setJoin(1, 2);

    expect(component.node().children?.[0]).toEqual(condition);
    expect(component.node().children?.[1].nodeType).toBe(1);
    expect(component.node().children?.[1].logicalJoinOperator).toBe(2);
  });

  it('updates the group that emitted a nested condition change', () => {
    const firstGroup = {
      nodeType: 1,
      logicalOperator: 1,
      logicalJoinOperator: 1,
      children: [],
    };
    const secondGroup = {
      nodeType: 1,
      logicalOperator: 1,
      logicalJoinOperator: 2,
      children: [],
    };
    fixture.componentRef.setInput('node', {
      ...emptyRoot(),
      children: [firstGroup, secondGroup],
    });

    component.updateChild(firstGroup, {
      ...firstGroup,
      children: [
        {
          nodeType: 2,
          logicalJoinOperator: 1,
          fieldKey: 'age',
          operator: 1,
          value: 10,
          children: [],
        },
      ],
    });

    const children = component.node().children ?? [];
    expect(children[0].children?.length).toBe(1);
    expect(children[1]).toEqual(secondGroup);
  });

  it('uses the configured multiple selection mode when changing operators', () => {
    fixture.componentRef.setInput('fields', [
      { key: 'items', label: 'Items', dataType: 'List', isMultiple: true },
    ]);
    fixture.componentRef.setInput('node', {
      nodeType: 2,
      fieldKey: 'items',
      operator: 1,
      value: 5,
      children: [],
    });

    component.onOperator(1);

    expect(component.node().value).toEqual([5]);
  });

  it('recognizes DateTime, Decimal, and MultipleSelect data types', () => {
    expect(isDataType('DateTime')).toBeTrue();
    expect(isDataType('Decimal')).toBeTrue();
    expect(isDataType('MultipleSelect')).toBeTrue();
  });

  it('defaults MultipleSelect fields to an empty selection', () => {
    expect(defaultValue({ dataType: 'MultipleSelect' })).toEqual([]);
  });

  it('keeps field data type ids separate from structural node types', () => {
    expect(FieldDataTypes.find(fieldType => fieldType.Name === 'Decimal')?.Id).toBe(4);
    expect(RuleNodeType.Condition).toBe(2);
    expect(RuleNodeType.Group).toBe(1);
  });

  it('uses isMultipleSelect to identify configured list fields', () => {
    fixture.componentRef.setInput('fields', [
      { key: 'single', label: 'Single', dataType: 'List', isMultiple: false },
      { key: 'multiple', label: 'Multiple', dataType: 'List', isMultiple: true },
      { key: 'multiSelect', label: 'Multi select', dataType: 'MultipleSelect' },
    ]);

    expect(component.isMultipleSelect(component.fields()[0])).toBeFalse();
    expect(component.isMultipleSelect(component.fields()[1])).toBeTrue();
    expect(component.isMultipleSelect(component.fields()[2])).toBeTrue();
  });

  it('returns static ItemList options based on field key', () => {
    expect(component.loadOptionsForField('ClaimedGross')).toEqual([
      { id: 'item1', name: 'item1' },
      { id: 'item2', name: 'item2' },
    ]);
    expect(component.loadOptionsForField('AnotherField')).toEqual([
      { id: 'item3', name: 'item3' },
      { id: 'item4', name: 'item4' },
    ]);
  });
});
