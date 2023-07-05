<script setup lang="ts">
import PageHeader from '@layouts/components/PageHeader.vue';
import MainBody from '@layouts/components/MainBody.vue';
import SideBar from '@layouts/components/SideBar.vue';
</script>

<template>
    <div>
        <PageHeader>
            <slot name="header"></slot>
        </PageHeader>
        <div class="gap-2 md:grid md:grid-cols-6">
            <div class="col-span-3 lg:col-span-4">
                <MainBody>
                    <slot name="body"></slot>
                </MainBody>
            </div>
            <div class="col-span-3 lg:col-span-2">
                <SideBar>
                    <slot name="sidebar"></slot>
                </SideBar>
            </div>
        </div>
    </div>
</template>
