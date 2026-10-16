using ClosedXML.Excel;
using DocumentFormat.OpenXml.Spreadsheet;
using RulesEngine.Common.Extensions;
using RulesEngine.Entities.WorkFlows.Rules;
using RulesEngine.Entities.WorkFlows.Rules.RuleBuilders;
using RulesEngine.Repositories.WorkFlows;
using RulesEngine.WorkFlows.Dtos.RuleBuildersDtos;
using RulesEngine.WorkFlows.Dtos.RulesDtos;
using RulesEngine.WorkFlows.Rules.Helpers;
using RulesEngine.WorkFlows.Rules.RuleExpressionBuilders;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Content;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Guids;

namespace RulesEngine.WorkFlows.Rules
{
    public class RuleAppService : CrudAppService<Rule, RuleDto, RuleListItemDto, Guid, PagedAndSortedResultRequestDto, CreateRuleDto, CreateRuleDto>, IRuleAppService
    {
        private readonly IRepository<RuleNode, Guid> _ruleNodeRepository;
        private readonly IWorkFlowRepository _workflowRepository;
        private readonly IRepository<RuleFormConfig, Guid> _formConfigRepository;
        private readonly IGuidGenerator _guidGenerator;
        private readonly IRuleExpressionBuilder _expressionsBuilder;

        public RuleAppService(
            IRepository<Rule, Guid> repository,
            IRepository<RuleNode, Guid> ruleNodeRepository,
           IWorkFlowRepository workflowRepository,
            IRepository<RuleFormConfig, Guid> formConfigRepository,
            IGuidGenerator guidGenerator,
            IRuleExpressionBuilder expressionsBuilder) : base(repository)
        {
            _ruleNodeRepository = ruleNodeRepository;
            _workflowRepository = workflowRepository;
            _formConfigRepository = formConfigRepository;
            _guidGenerator = guidGenerator;
            _expressionsBuilder = expressionsBuilder;
        }

        public override async Task<PagedResultDto<RuleListItemDto>> GetListAsync(PagedAndSortedResultRequestDto input)
        {
            input.Sorting = input.Sorting ?? "CreationTime desc";

            var workflows = (await _workflowRepository.GetListAsync()).ToDictionary(x => x.Id, x => x.Name);
            var allRules = (await Repository.GetListAsync()).OrderBy(x => x.Name).ToList();
            var total = allRules.Count;

            var paged = allRules.Skip(input.SkipCount).Take(input.MaxResultCount).ToList();

            var items = paged.Select(x => new RuleListItemDto
            {
                Id = x.Id,
                Name = x.Name,
                WorkflowId = x.WorkflowId,
                WorkflowName = workflows.GetValueOrDefault(x.WorkflowId),
                IsActive = x.IsActive
            }).ToList();

            return new PagedResultDto<RuleListItemDto>(total, items);
        }

        public override async Task<RuleDto> GetAsync(Guid id)
        {
            var rule = await Repository.FirstOrDefaultAsync(x => x.Id == id)
                       ?? throw new KeyNotFoundException("Rule not found.");
            var nodes = (await _ruleNodeRepository.GetListAsync(x => x.RuleId == id)).OrderBy(x => x.Order).ToList();

            return new RuleDto
            {
                Id = rule.Id,
                Name = rule.Name,
                WorkflowId = rule.WorkflowId,
                IsActive = rule.IsActive,
                Root = RuleTreeMapper.ToTree(nodes)
            };
        }

        public override async Task<RuleDto> CreateAsync(CreateRuleDto input)
        {
            return await SaveRuleAsync(input, null);
        }

        public override async Task<RuleDto> UpdateAsync(Guid id, CreateRuleDto input)
        {
            return await SaveRuleAsync(input, id);
        }

        public override async Task DeleteAsync(Guid id)
        {
            var nodes = await _ruleNodeRepository.GetListAsync(n => n.RuleId == id);
            foreach (var n in nodes)
            {
                await _ruleNodeRepository.DeleteAsync(n);
            }

            await Repository.DeleteAsync(id);
        }

        private async Task<RuleDto> SaveRuleAsync(CreateRuleDto input, Guid? id)
        {
            if (string.IsNullOrWhiteSpace(input.Name))
                throw new RuleValidationException("Rule name is required.");

            var workflow = await _workflowRepository.GetAsync(input.WorkflowId)
                           ?? throw new RuleValidationException("Workflow not found.");

            var config = workflow.Ruleformconfig;

            if (config == null)
                throw new RuleValidationException("This workflow has no form config assigned.");
            var configdto = new RuleFormConfigDto
            {
                Id = config.Id,
                Name = config.Name,
                Fields = config.RuleFormConfigFields.Select(f => new RuleFormFieldDto
                {
                    Id = f.RulefieldId,
                    Key = f.Rulefield.Key,
                    DataType = f.Rulefield.DataType,
                    AllowedOperators = ListExtensions.DeserializeIntList(f.AllowedOperatorsJson),
                    Label = f.Rulefield.Label,
                    Options = ListExtensions.DeserializeStringList(f.Rulefield.OptionsJson),
                    IsMultiple = f.IsMultiple
                }).ToList()
            };
            RuleTreeValidator.Validate(input.Root, configdto);
            var ruleDto = ObjectMapper.Map<CreateRuleDto, RuleDto>(input);
            var expressionsRes = await _expressionsBuilder.BuildForRuleAsync(ruleDto);

            var ruleId = id ?? Guid.CreateVersion7();

            var existing = await Repository.FirstOrDefaultAsync(r => r.Id == ruleId);
            if (existing != null)
            {
                var existingNodes = await _ruleNodeRepository.GetListAsync(n => n.RuleId == existing.Id);
                foreach (var n in existingNodes)
                {
                    await _ruleNodeRepository.DeleteAsync(n);
                }

                await Repository.DeleteAsync(existing.Id);
            }

            var rule = id.HasValue ? Rule.Update(ruleId, input.Name.Trim(), input.WorkflowId, expressionsRes.Expression) : new Rule(ruleId, input.Name.Trim(), input.WorkflowId, expressionsRes.Expression);

            if (input.IsActive) rule.Activate(); else rule.Deactivate();


            var flatnodes = new List<RuleNode>();
            RuleTreeMapper.Flatten(input.Root, rule.Id, null, 0, flatnodes);

            rule.AddNodes(flatnodes);
            if (!id.HasValue)
            {
                await Repository.InsertAsync(rule);


            }
            else
            {
                await Repository.UpdateAsync(rule);

            }

            return ruleDto;
        }

        public Task<RuleExpressionResultDto> PreviewExpression(RuleDto input) => _expressionsBuilder.BuildForRuleAsync(input);

        // New APIs: sample Excel (.xlsx) generation and bulk upload using ClosedXML
        public async Task<IRemoteStreamContent> GetRulesSampleAsync(Guid workflowId)
        {
            var workflow = await _workflowRepository.GetAsync( workflowId)
                ?? throw new KeyNotFoundException("Workflow not found.");

            var config = workflow.RuleformconfigId == Guid.Empty ? null : await _formConfigRepository.GetAsync(f => f.Id == workflow.RuleformconfigId);
            if (config == null) throw new RuleValidationException("This workflow has no form config assigned.");

            var configFields = config.RuleFormConfigFields.OrderBy(f => f.Order).ToList();
            var fields = configFields.Select(cf => cf.Rulefield).ToList();

            using var workbook = new XLWorkbook();
            var ws = workbook.Worksheets.Add("RulesSample");

            // Headers
            var colIndex = 1;
            ws.Cell(1, colIndex++).Value = "Name";
            ws.Cell(1, colIndex++).Value = "IsActive";
            foreach (var f in fields)
            {
                var header = f.Key;
                if (!string.IsNullOrWhiteSpace(f.OptionsJson))
                {
                    try
                    {
                        var opts = JsonSerializer.Deserialize<List<string>>(f.OptionsJson) ?? new List<string>();
                        if (opts.Count > 0) header += $" (options:{string.Join('|', opts)})";
                    }
                    catch { }
                }
                ws.Cell(1, colIndex++).Value = header;
            }

            ws.Row(1).Style.Font.SetBold();

            // Add data validation for option fields
            var lastRowValidation = 1000;
            for (int i = 0; i < fields.Count; i++)
            {
                var f = fields[i];
                if (!string.IsNullOrWhiteSpace(f.OptionsJson))
                {
                    try
                    {
                        var opts = JsonSerializer.Deserialize<List<string>>(f.OptionsJson) ?? new List<string>();
                        if (opts.Count > 0)
                        {
                            var col = 3 + i; // Name=1, IsActive=2, fields start at 3
                            var range = ws.Range(2, col, lastRowValidation, col);
                            var dv = range.SetDataValidation();
                            dv.List(string.Join(",", opts));
                        }
                    }
                    catch { }
                }
            }

            // Populate sample row or existing rules
            var rules = (await Repository.GetListAsync(r => r.WorkflowId == workflowId)).ToList();
            var row = 2;
            if (!rules.Any())
            {
                ws.Cell(row, 1).Value = "Sample rule";
                ws.Cell(row, 2).Value = true;
                for (int i = 0; i < fields.Count; i++)
                {
                    var f = fields[i];
                    var col = 3 + i;
                    var v = string.Empty;
                    if (!string.IsNullOrWhiteSpace(f.OptionsJson))
                    {
                        try { var opts = JsonSerializer.Deserialize<List<string>>(f.OptionsJson); if (opts?.Count > 0) v = opts[0]; } catch { }
                    }
                    ws.Cell(row, col).Value = v;
                }
            }
            else
            {
                var ruleIds = rules.Select(r => r.Id).ToList();
                var allNodes = (await _ruleNodeRepository.GetListAsync(n => ruleIds.Contains(n.RuleId))).ToList();
                foreach (var rule in rules)
                {
                    ws.Cell(row, 1).Value = rule.Name;
                    ws.Cell(row, 2).Value = rule.IsActive;
                    for (int i = 0; i < fields.Count; i++)
                    {
                        var f = fields[i];
                        var col = 3 + i;
                        var node = allNodes.FirstOrDefault(n => n.RuleId == rule.Id && n.FieldKey == f.Key);
                        var cellVal = string.Empty;
                        if (node?.ValueJson != null)
                        {
                            try
                            {
                                var doc = JsonDocument.Parse(node.ValueJson);
                                if (doc.RootElement.ValueKind == JsonValueKind.Array)
                                {
                                    var parts = doc.RootElement.EnumerateArray().Select(x => x.ToString()).ToArray();
                                    cellVal = string.Join('|', parts);
                                }
                                else if (doc.RootElement.ValueKind == JsonValueKind.String)
                                {
                                    cellVal = doc.RootElement.GetString() ?? string.Empty;
                                }
                                else
                                {
                                    cellVal = doc.RootElement.ToString();
                                }
                            }
                            catch { }
                        }
                        ws.Cell(row, col).Value = cellVal;
                    }
                    row++;
                }
            }

              var stream = new MemoryStream();
            workbook.SaveAs(stream);
            stream.Position = 0;

            return new RemoteStreamContent(
                stream,
                "Rules_Import_Template.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );
        }

        public async Task BulkUploadAsync(Guid workflowId, byte[] fileContent)
        {
            if (fileContent == null || fileContent.Length == 0) return;

            using var ms = new MemoryStream(fileContent);
            using var wb = new XLWorkbook(ms);
            var ws = wb.Worksheets.First();

            var firstRow = ws.FirstRowUsed();
            if (firstRow == null) return;

            var headerCells = ws.Row(1).CellsUsed().ToList();
            if (!headerCells.Any()) return;

            string UnwrapHeader(string h)
            {
                h = h?.Trim() ?? string.Empty;
                var idx = h.IndexOf('(');
                if (idx > 0) return h.Substring(0, idx).Trim();
                return h;
            }

            var colKeys = headerCells.Select(c => UnwrapHeader(c.GetString())).ToList();

            var workflow = await _workflowRepository.FirstOrDefaultAsync(w => w.Id == workflowId)
                ?? throw new KeyNotFoundException("Workflow not found.");
            var config = workflow.RuleformconfigId == Guid.Empty ? null : await _formConfigRepository.FirstOrDefaultAsync(f => f.Id == workflow.RuleformconfigId);
            if (config == null) throw new RuleValidationException("This workflow has no form config assigned.");
            var allowed = config.RuleFormConfigFields.ToDictionary(cf => cf.Rulefield.Key, cf => cf);

            var nameIndex = colKeys.FindIndex(c => string.Equals(c, "Name", StringComparison.OrdinalIgnoreCase));
            var isActiveIndex = colKeys.FindIndex(c => string.Equals(c, "IsActive", StringComparison.OrdinalIgnoreCase));

            var lastRow = ws.LastRowUsed().RowNumber();

            for (int r = 2; r <= lastRow; r++)
            {
                var ruleName = nameIndex >= 0 ? ws.Cell(r, nameIndex + 1).GetString() : null;
                if (string.IsNullOrWhiteSpace(ruleName)) continue;
                var isActive = true;
                if (isActiveIndex >= 0)
                {
                    var cell = ws.Cell(r, isActiveIndex + 1);
                    var s = cell.GetString();
                    if (!string.IsNullOrWhiteSpace(s)) bool.TryParse(s, out isActive);
                }

                var root = new RuleNodeDto { Id = Guid.NewGuid(), NodeType = RulesEngine.Common.Enums.RuleNodeType.Group };

                for (int c = 0; c < colKeys.Count; c++)
                {
                    var key = colKeys[c];
                    if (string.Equals(key, "Name", StringComparison.OrdinalIgnoreCase) || string.Equals(key, "IsActive", StringComparison.OrdinalIgnoreCase)) continue;
                    var cell = ws.Cell(r, c + 1);
                    var val = cell.GetString()?.Trim();
                    if (string.IsNullOrWhiteSpace(val)) continue;
                    if (!allowed.ContainsKey(key)) continue;

                    var cfg = allowed[key];
                    var field = cfg.Rulefield;
                    var node = new RuleNodeDto
                    {
                        Id = Guid.NewGuid(),
                        NodeType = RulesEngine.Common.Enums.RuleNodeType.Condition,
                        FieldKey = key,
                        Operator = RulesEngine.Common.Enums.RuleOperator.Equal
                    };

                    if (cfg.IsMultiple || val.Contains('|') || (field.DataType == "List" && val.Contains(',')))
                    {
                        var parts = val.Split(new[] { '|', ',' }, StringSplitOptions.RemoveEmptyEntries).Select(s => s.Trim()).ToArray();
                        var json = JsonSerializer.Serialize(parts);
                        node.Value = JsonDocument.Parse(json).RootElement;
                    }
                    else
                    {
                        var json = JsonSerializer.Serialize(val);
                        node.Value = JsonDocument.Parse(json).RootElement;
                    }

                    if (root.Children.Count > 0) node.LogicalJoinOperator = RulesEngine.Common.Enums.LogicalOperator.And;
                    root.Children.Add(node);
                }

                if (root.Children.Count == 0)
                {
                    var emptyRoot = new RuleNodeDto { Id = Guid.NewGuid(), NodeType = RulesEngine.Common.Enums.RuleNodeType.Group };
                    await SaveRuleAsync(new CreateRuleDto { Name = ruleName.Trim(), WorkflowId = workflowId, IsActive = isActive, Root = emptyRoot }, null);
                }
                else
                {
                    var createDto = new CreateRuleDto { Name = ruleName.Trim(), WorkflowId = workflowId, IsActive = isActive, Root = root };
                    await CreateAsync(createDto);
                }
            }
        }
    }
}
