<template>
  <div class="container" >
    <Breadcrumb :items="['menu.system', 'menu.system.account']" />
    <a-card class="general-card onelineCard" >
      <a-row style="margin-bottom: 10px">
        <a-col :span="12">
          <a-space>
          </a-space>
        </a-col>
        <a-col
          :span="12"
           style="text-align: right;"
        >
        <a-space>
          <a-button type="primary" @click="createRule">
            <template #icon>
              <icon-plus />
            </template>
            {{ $t('searchTable.operation.create') }}
          </a-button>
          <a-tooltip :content="$t('searchTable.actions.refresh')">
            <div class="action-icon" @click="search"
              ><icon-refresh size="18"
            /></div>
          </a-tooltip>
          <a-dropdown @select="handleSelectDensity">
            <a-tooltip :content="$t('searchTable.actions.density')">
              <div class="action-icon"><icon-line-height size="18" /></div>
            </a-tooltip>
            <template #content>
              <a-doption
                v-for="item in densityList"
                :key="item.value"
                :value="item.value"
                :class="{ active: item.value === size }"
              >
                <span>{{ item.name }}</span>
              </a-doption>
            </template>
          </a-dropdown>
          </a-space>
        </a-col>
      </a-row>
      <a-table
         row-key="id"
        :loading="loading"
        :pagination="pagination"
        :columns="(cloneColumns as TableColumnData[])"
        :data="renderData"
        :bordered="{wrapper:true,cell:true}"
        :size="size"
        :default-expand-all-rows="true"
        ref="artable"
        @page-change="handlePaageChange" 
        @page-size-change="handlePaageSizeChange" 
      >
        <template #name="{ record }">
         {{ record.name }}<span v-if="record.nickname" style="padding-left: 5px;color: var(--color-neutral-4);">{{ record.nickname }}</span>
        </template>
        <template #avatar="{ record }">
          <a-avatar trigger-type="mask">
            <img
              alt="avatar"
              :src="record.avatar"
            />
            <template #trigger-icon>
              <IconEdit />
            </template>
          </a-avatar>
        </template>
        <template #createtime="{ record }">
          {{dayjs(record.createtime*1000).format("YYYY-MM-DD")}}
        </template>
        <template #status="{ record }">
          <a-switch type="round" v-model="record.status" :checked-value="0" :unchecked-value="1" @change="handleStatus(record)">
              <template #checked>
                开
              </template>
              <template #unchecked>
                关
              </template>
            </a-switch>
        </template>
        <template #operations="{ record }">
          <Icon icon="svgfont-bianji1" class="iconbtn" @click="handleEdit(record)" :size="18" color="#0960bd"></Icon>
          <a-divider direction="vertical" />
          <a-popconfirm content="您确定要删除吗?" @ok="handleDel(record)">
            <Icon icon="svgfont-icon7" class="iconbtn" :size="18" color="#ed6f6f"></Icon>
          </a-popconfirm>
        </template>
      </a-table>
    </a-card>
    <!--表单-->
    <AddForm @register="registerModal"  @success="handleData"/>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive, watch, nextTick } from 'vue';
  import useLoading from '@/hooks/loading';
  import { getList,upStatus,del} from '@/api/system/account';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import cloneDeep from 'lodash/cloneDeep';
  import dayjs from 'dayjs';
  //数据
  import { columns} from './data';
  //表单
  import { useModal } from '/@/components/Modal';
  import AddForm from './AddForm.vue';
  import { useI18n } from 'vue-i18n';
  import {Icon} from '@/components/Icon';
  import { Message } from '@arco-design/web-vue';
  import { Pagination } from '@/types/global';
  const { t } = useI18n();
  const [registerModal, { openModal }] = useModal();
  const densityList = computed(() => [
    {
      name: t('searchTable.size.mini'),
      value: 'mini',
    },
    {
      name: t('searchTable.size.small'),
      value: 'small',
    },
    {
      name: t('searchTable.size.medium'),
      value: 'medium',
    },
    {
      name: t('searchTable.size.large'),
      value: 'large',
    },
  ]);
  //分页
  const basePagination: Pagination = {
    current: 1,
    pageSize: 10,
  };
  const pagination = reactive({
    ...basePagination,
    showTotal:true,
    showPageSize:true,
  });
  const boxheight=document.documentElement.clientHeight;//页面高度
  type SizeProps = 'mini' | 'small' | 'medium' | 'large';
  type Column = TableColumnData & { checked?: true };
  const { loading, setLoading } = useLoading(true);
  const renderData = ref([]);
  const cloneColumns = ref<Column[]>([]);
  const showColumns = ref<Column[]>([]);
  const size = ref<SizeProps>('large');
  const artable=ref()
  const fetchData = async () => {
    setLoading(true);
    try {
      const data= await getList({page:pagination.current,pageSize:pagination.pageSize});
      renderData.value = data.items;
      pagination.current = data.page;
      pagination.total = data.total;
      nextTick(()=>{
        artable.value.expandAll()
      })
    } catch (err) {
      // you can report use errorHandler or other
    } finally {
      setLoading(false);
    }
  };

  const search = () => {
    fetchData();
  };

  fetchData();
  const handleSelectDensity = (
    val: string | number | Record<string, any> | undefined,
    e: Event
  ) => {
    size.value = val as SizeProps;
  };

  watch(
    () => columns.value,
    (val) => {
      cloneColumns.value = cloneDeep(val);
      cloneColumns.value.forEach((item, index) => {
        item.checked = true;
      });
      showColumns.value = cloneDeep(cloneColumns.value);
    },
    { deep: true, immediate: true }
  );
  //添加菜单
  const createRule=()=>{
    openModal(true, {
      isUpdate: false,
      record:null
    });
  }
  //编辑数据
  const handleEdit=async(record:any)=>{
    openModal(true, {
      isUpdate: true,
      record:record
    });
  }
  //更新数据
  const handleData=async()=>{
    fetchData();
  }
  //分页
  const handlePaageChange = (page:any) => {
    pagination.current=page
    fetchData();
  }
  //分页总数
  const handlePaageSizeChange = (pageSize:any) => {
    pagination.pageSize=pageSize
    fetchData();
  }
  //更新状态
  const handleStatus=async(record:any)=>{
    try {
        Message.loading({content:"更新状态中",id:"upStatus"})
       const res= await upStatus({id:record.id,status:record.status});
       if(res){
         Message.success({content:"更新状态成功",id:"upStatus"})
       }
    }catch (error) {
      Message.clear("top")
    } 
  }
  //删除数据
  const handleDel=async(record:any)=>{
    try {
        Message.loading({content:"删除中",id:"upStatus"})
       const res= await del({ids:[record.id]});
       if(res){
        fetchData();
         Message.success({content:"删除成功",id:"upStatus"})
       }
    }catch (error) {
      Message.clear("top")
    } 
  }
</script>

<script lang="ts">
  export default {
    name: 'Rule',
  };
</script>

<style scoped lang="less">
  .container {
    padding: 0 20px 20px 20px;
    height: 100%;
  }
  :deep(.arco-table-th) {
    &:last-child {
      .arco-table-th-item-title {
        margin-left: 16px;
      }
    }
  }
  .action-icon {
    margin-left: 12px;
    cursor: pointer;
  }
  .active {
    color: #0960bd;
    background-color: #e3f4fc;
  }
  .setting {
    display: flex;
    align-items: center;
    width: 200px;
    .title {
      margin-left: 12px;
      cursor: pointer;
    }
  }
  :deep(.general-card > .arco-card-header){
    padding: 10px 16px;
  }
  .iconbtn{
    user-select: none;
    cursor: pointer;
    opacity: .8;
    &:hover{
      opacity: 1;
    }
  }
</style>
