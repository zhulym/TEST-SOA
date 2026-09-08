import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { Button, Flex, Popover, Spin, Switch, Tooltip, Typography } from 'antd';
import cn from 'classnames';

import {
  useCreateAiChat,
  useForceStopPromptExecution,
  useGetLlmSetting,
  useSaveAiChatContext
} from '@__root/hooks';
import { useChatStore } from '@__root/stores';
import { AI_CHAT_STATUS, ICreateAiChatData } from '@__root/types';
import { getAssistantNameForApi, isElectron, useAssistantName } from '@__root/utils';
import { LeftOutlined, SettingOutlined, SyncOutlined } from '@ant-design/icons';

import { ReactComponent as McpIcon } from '../../../../assets/icons/mcp.svg';
import { ReactComponent as StopIcon } from '../../../../assets/icons/stop.svg';
import AIChatMcpPanel from './AIChatMcpPanel';
import AIChatSettingsModal from './AIChatSettingsModal';

import styles from './AIChat.module.scss';

const { Title } = Typography;

type SettingsParamsType = Record<string, string | number | boolean | string[]>;

interface IProps {
  showContextSetup: boolean;
  setShowContextSetup: Dispatch<SetStateAction<boolean>>;
  setIsAIChatDrawerOpen: Dispatch<SetStateAction<boolean>>;
  onAddMcpServer: () => void;
  onEditMcpServer: (serverId: string) => void;
}

const AIChatHeader = ({
  showContextSetup,
  setShowContextSetup,
  setIsAIChatDrawerOpen,
  onAddMcpServer,
  onEditMcpServer
}: IProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isOpenSettingsModal, setIsOpenSettingsModal] = useState(false);
  const [isOpenMcpPanel, setIsOpenMcpPanel] = useState(false);
  const [defaultParams, setDefaultParams] = useState<SettingsParamsType>({});

  const {
    aiChatStatus,
    currentAiChat,
    cleanChatMessages,
    cleanQueueInputMessage,
    isAgentMode,
    setIsAgentMode,
    isAgentExecutionCompleted
  } = useChatStore();

  const { t } = useTranslation();
  const assistantName = useAssistantName();
  const { mutate: createAiChat, isPending: isChatCreating } = useCreateAiChat();
  const { onForceStop } = useForceStopPromptExecution(currentAiChat?.id || '');
  const isNarrow = containerWidth <= 400;
  const { saveChatContext } = useSaveAiChatContext(false);
  const { data: llmSettingData } = useGetLlmSetting(
    currentAiChat?.llm_setting_id || null,
    isOpenSettingsModal
  );
  const defaultLlmSetting = llmSettingData?.payload || null;

  const isChatReady = isAgentMode
    ? isAgt-dev-chat',
      assistant_name: assistantNameForApi,
      llm_setting_id: currentAiChat?.llm_setting_id || '',
      agent_mode: isAgentMode
    };

    createAiChat({ requestData });
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  const handleChangeAgentMode = (checked: boolean) => {
    setIsAgentMode(checked);
    if (currentAiChat) {
      saveChatContext();
    }
  };

  return (
    <Flex className={styles.headerContainer} ref={containerRef}>
      <Flex gap={8} align="center">
        <Button
          type="text"
          size="small"
          onClick={
            showContextSetup ? () => setShowContextSetup(false) : () => setIsAIChatDrawerOpen(false)
          }
        >
          <LeftOutlined />
        </Button>
        <Title ellipsis={{ tooltip: t('webIDE.titles.aiChat') }} level={5}>
          {t('webIDE.titles.aiChat')}
          {showContextSetup ? ` / ${t('webIDE.titles.setupContextTitle')}` : ''}
        </Title>

        {!showContextSetup && (
          <Tooltip title={t('webIDE.messages.cleanAndUpdateChat')}>
            <Button
              id="aiChatRecreate"
              type="text"
              size="small"
              onClick={onAiChatRecreate}
              disabled={!isChatReady}
            >
              <SyncOutlined />
            </Button>
          </Tooltip>
        )}
        {(isChatCreating || !isChatReady) && <Spin />}
      </Flex>
      <Flex className={cn(styles.headerActions, { [styles.narrowActions]: isNarrow })} gap={8}>
        {!isChatReady && (
          <Tooltip title={t('buttons.forceStop')}>
            <Button
              size="small"
              color="default"
              variant="filled"
              onClick={onForceStop}
              className={styles.stopButton}
              icon={<StopIcon style={{ transform: 'scale(0.15)' }} />}
            />
          </Tooltip>
        )}

        {!showContextSetup && (
          <>
            {currentAiChat && (
              <>
                {isElectron() && (
                  <Popover
                    trigger="click"
                    placement="bottomRight"
                    open={isOpenMcpPanel}
                    onOpenChange={setIsOpenMcpPanel}
                    content={
                      <AIChatMcpPanel
                        onClosePopover={() => setIsOpenMcpPanel(false)}
                        onAddMcpServer={() => {
                          setIsOpenMcpPanel(false);
                          onAddMcpServer();
                        }}
                        onEditMcpServer={(serverId) => {
                          setIsOpenMcpPanel(false);
                          onEditMcpServer(serverId);
                        }}
                      />
                    }
                  >
                    <Tooltip title="MCP">
                      <Button id="aiChatMcp" type="text" size="small" icon={<McpIcon />} />
                    </Tooltip>
                  </Popover>
                )}

                <Tooltip title={t('chat.titles.settings')}>
                  <Button
                    id="aiChatSettings"
                    type="text"
                    size="small"
                    icon={<SettingOutlined />}
                    onClick={() => setIsOpenSettingsModal(true)}
                  />
                </Tooltip>
              </>
            )}

            <Flex align="center" gap={4}>
              <Tooltip title={t('webIDE.messages.agentMode')}>
                <Switch
                  id="aiChatAgentMode"
                  size="small"
                  checked={isAgentMode}
                  onChange={handleChangeAgentMode}
                  disabled={!isChatReady || !currentAiChat}
                />
              </Tooltip>
              {!isNarrow && (
                <span style={{ fontSize: 12, color: '#666' }}>{t('webIDE.messages.agent')}</span>
              )}
            </Flex>
          </>
        )}
      </Flex>

      {currentAiChat && isOpenSettingsModal && (
        <AIChatSettingsModal
          chat={currentAiChat}
          open={isOpenSettingsModal}
          onClose={() => setIsOpenSettingsModal(false)}
          onCancel={() => setIsOpenSettingsModal(false)}
          assistantName={assistantName}
          defaultParams={defaultParams}
          setDefaultParams={setDefaultParams}
          defaultLlmSetting={defaultLlmSetting}
        />
      )}
    </Flex>
  );
};

export default AIChatHeader;



































